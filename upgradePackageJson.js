/* Clones e-mission-phone and attempts to get this package.json in sync
    with the package.cordovabuild.json in e-mission-phone.
  Useful for keeping em-devapp in sync when we bump versions or
    add new plugins on e-mission-phone.
*/


const { existsSync, readFileSync, writeFileSync } = require('fs');
const { execSync } = require('child_process');

const repoUrl = 'https://github.com/e-mission/e-mission-phone.git';
const repoPath = './.e-mission-phone';

if (existsSync(repoPath)) {
    console.log(`repo already exists at ${repoPath}`);
    const result = execSync('git pull origin master');
    console.log({ result });
} else {
    console.log(`cloning ${repoUrl} to ${repoPath}`);
    const cmd = `git clone ${repoUrl} ${repoPath}`;
    console.log(cmd);
    const result = execSync(cmd);
    console.log({ result });
}

const packageJson = JSON.parse(readFileSync(`${__dirname}/package.json`, 'utf8'));
console.log(packageJson);

const phoneRepoPackageJson = JSON.parse(readFileSync(`${repoPath}/package.cordovabuild.json`, 'utf8'));
console.log(phoneRepoPackageJson);

function deepMerge(obj1, obj2) {
    for (const key in obj2) {
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
            deepMerge(obj1[key], obj2[key]);
        } else {
            obj1[key] = obj2[key];
        }
    }
    return obj1;
}

packageJson['cordova'] = deepMerge(packageJson['cordova'], phoneRepoPackageJson['cordova']);
packageJson['dependencies'] = deepMerge(packageJson['dependencies'], phoneRepoPackageJson['dependencies']);
console.log(JSON.stringify(packageJson));

writeFileSync(`${__dirname}/package.json`, JSON.stringify(packageJson, null, 2));

console.log('updated package.json, please run `npm install` now');
