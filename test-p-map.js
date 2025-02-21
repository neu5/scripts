import pMap from 'p-map';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir } from 'fs/promises';

const execAsync = promisify(exec);

async function getPackages() {
    const dirs = await readdir('./packages', { withFileTypes: true });
    return dirs.filter(dir => dir.isDirectory()).map(dir => `./packages/${dir.name}`);
}

async function runTests() {
    const packages = await getPackages();
    await pMap(
        packages,
        async (pkg) => {
            console.log(`Running tests in ${pkg}`);
            try {
                await execAsync(`npm test`, { cwd: pkg });
                console.log(`✅ ${pkg} passed`);
            } catch (error) {
                console.error(`❌ ${pkg} failed`);
            }
        },
        { concurrency: 10 } // Adjust concurrency level as needed
    );
}

runTests().catch(console.error);
