import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
  process.stderr.write('Usage: npm run release -- <major.minor.patch>\n');
  process.exit(1);
}
const [major, minor] = version.split('.');

const run = (cmd: string, cwd = '.') => execSync(cmd, { cwd, stdio: 'inherit' });
const edit = (path: string, fn: (s: string) => string) => writeFileSync(path, fn(readFileSync(path, 'utf-8')));

run(`git switch -c chore/release-${version}`);

// npm version also keeps package-lock.json in sync
run(`npm version ${version} --no-git-tag-version`, 'app');
run(`npm version ${version} --no-git-tag-version`, 'frontend');

edit('charts/pcns/Chart.yaml', (s) =>
  s
    .replace(/^appVersion: ".*"$/m, `appVersion: "${version}"`)
    .replace(/^version: (\d+)\.(\d+)\.(\d+)$/m, (_, a, b, c) => `version: ${a}.${b}.${Number(c) + 1}`)
);
run('helm-docs', 'charts/pcns');

edit('SECURITY.md', (s) =>
  s
    .replace(/\d+\.\d+\.\d+(?=\s+\| :white_check_mark:)/, version)
    .replace(/< \d+\.\d+\.x/, `< ${major}.${minor}.x`)
);
