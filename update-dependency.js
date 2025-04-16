const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, 'packages');
const dependencyToUpdate = 'dependency-name'; // 🔧 Replace with the actual dependency name
const newVersion = 'workspace:*';

function updateDependencyVersion(pkgJsonPath) {
  const content = fs.readFileSync(pkgJsonPath, 'utf-8');
  const pkg = JSON.parse(content);

  let updated = false;

  ['dependencies', 'devDependencies', 'peerDependencies'].forEach((depType) => {
    if (pkg[depType] && pkg[depType][dependencyToUpdate]) {
      pkg[depType][dependencyToUpdate] = newVersion;
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    console.log(`✅ Updated ${dependencyToUpdate} in ${pkgJsonPath}`);
  }
}

function walkPackages(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkPackages(fullPath);
    } else if (entry.name === 'package.json') {
      updateDependencyVersion(fullPath);
    }
  });
}

// 🔄 Start the update process
walkPackages(packagesDir);
