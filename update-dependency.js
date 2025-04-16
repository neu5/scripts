const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, 'packages');
const workspaceDependencyVersion = 'workspace:*';

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

function updateDependenciesToWorkspace(pkgJsonPath, workspacePackageNames) {
  const content = fs.readFileSync(pkgJsonPath, 'utf-8');
  const pkg = JSON.parse(content);

  let updated = false;

  ['dependencies', 'devDependencies', 'peerDependencies'].forEach((depType) => {
    if (pkg[depType]) {
      for (const name of workspacePackageNames) {
        if (pkg[depType][name] && pkg[depType][name] !== workspaceDependencyVersion) {
          pkg[depType][name] = workspaceDependencyVersion;
          updated = true;
        }
      }
    }
  });

  if (updated) {
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    console.log(`✅ Updated dependencies in ${pkgJsonPath}`);
  }
}

// 🔄 Run the whole process
const packageJsonPaths = getAllPackageJsonPaths(packagesDir);
const workspacePackageNames = collectWorkspacePackageNames(packageJsonPaths);

console.log('📦 Found workspace packages:', workspacePackageNames);

for (const pkgPath of packageJsonPaths) {
  updateDependenciesToWorkspace(pkgPath, workspacePackageNames);
}
