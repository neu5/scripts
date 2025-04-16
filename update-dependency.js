const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, 'packages');
const workspaceDependencyVersion = 'workspace:*';

/**
 * Get all direct package.json files in packages/*/
 */
function getTopLevelPackageJsonPaths() {
  const subdirs = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(packagesDir, dirent.name, 'package.json'))
    .filter(pkgPath => fs.existsSync(pkgPath));

  return subdirs;
}

/**
 * Collect names of internal workspace packages from top-level package.json files
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

// 🔄 Run the process
const topLevelPackageJsonPaths = getTopLevelPackageJsonPaths();
const internalPackageNames = collectWorkspacePackageNames(topLevelPackageJsonPaths);

console.log('📦 Found internal packages:', internalPackageNames);

for (const pkgPath of topLevelPackageJsonPaths) {
  updateDependenciesToWorkspace(pkgPath, internalPackageNames);
}
