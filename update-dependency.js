const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, 'packages');
const workspaceDependencyVersion = 'workspace:*';

/**
 * Recursively get all package.json files under a given directory
 */
function getAllPackageJsonPaths(dir) {
  const results = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name === 'package.json') {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

/**
 * Collect names of internal workspace packages
 */
function collectWorkspacePackageNames(packageJsonPaths) {
  const names = [];

  for (const filePath of packageJsonPaths) {
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      const pkg = JSON.parse(content);
      if (pkg.name) {
        names.push(pkg.name);
      }
    } catch (err) {
      console.error(`❌ Failed to parse ${filePath}: ${err.message}`);
    }
  }

  return names;
}

/**
 * Update only the internal dependency versions to "workspace:*"
 */
function updateDependenciesToWorkspace(pkgJsonPath, internalPackageNames) {
  const content = fs.readFileSync(pkgJsonPath, 'utf-8');
  const pkg = JSON.parse(content);

  let updated = false;

  ['dependencies', 'devDependencies', 'peerDependencies'].forEach((depType) => {
    if (pkg[depType]) {
      internalPackageNames.forEach((name) => {
        if (Object.prototype.hasOwnProperty.call(pkg[depType], name)) {
          if (pkg[depType][name] !== workspaceDependencyVersion) {
            pkg[depType][name] = workspaceDependencyVersion;
            updated = true;
          }
        }
      });
    }
  });

  if (updated) {
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    console.log(`✅ Updated dependencies in ${pkgJsonPath}`);
  }
}

// 🔄 Run the whole process
const packageJsonPaths = getAllPackageJsonPaths(packagesDir);
const internalPackageNames = collectWorkspacePackageNames(packageJsonPaths);

console.log('📦 Found internal packages:', internalPackageNames);

for (const pkgPath of packageJsonPaths) {
  updateDependenciesToWorkspace(pkgPath, internalPackageNames);
}
