#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const validBranchRegex = /^(main|(?:bugfix|chore|ci|docs|feature|release|renovate)\/[a-z0-9.-]+)$/;

/**
 * Gets the current Git branch name or exits on failure.
 * @returns Current branch name.
 */
function getCurrentBranch(): string {
  try {
    const branch = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      encoding: 'utf-8',
      shell: true,
      stdio: ['ignore', 'pipe', 'inherit']
    });
    if (branch.status !== 0) throw new Error('Failed to get current branch name.');
    return branch.stdout.trim();
  } catch (error) {
    console.error('Error determining current branch:', error); // eslint-disable-line no-console
    process.exit(1);
  }
}

/**
 * Runs a command synchronously and exits if it fails.
 * @param cmd - Command to execute.
 * @param args - Arguments for the command.
 */
function run(cmd: string, ...args: string[]) {
  const res = spawnSync(cmd, args, {
    encoding: 'utf-8',
    shell: true,
    stdio: 'inherit'
  });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

/**
 * Ensures the current branch name follows a naming convention and subsequent checks.
 * Exits with code 1 if the branch name is invalid.
 */
function main() {
  const branch = getCurrentBranch();
  if (validBranchRegex.test(branch)) {
    console.info(`Branch name '${branch}' is valid.`); // eslint-disable-line no-console
  } else {
    // eslint-disable-next-line no-console
    console.error(`Invalid branch name '${branch}'. Branches must match: ${validBranchRegex}. Rename to proceed.`);
    process.exit(1);
  }

  // Run any subsequent commands
  run('npm', 'run', 'lint');
}

main();
