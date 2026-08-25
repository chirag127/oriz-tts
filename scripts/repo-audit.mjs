#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(process.env.WORKSPACE_ROOT || new URL('..', import.meta.url).pathname);
const reposDir = join(root, 'repos');
const output = process.env.REPO_AUDIT_OUTPUT || join(root, 'repo-inventory.json');

function git(args, cwd) {
  try { return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
}
function command(name, args, cwd) {
  try { return execFileSync(name, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
}
function files(dir) { return existsSync(dir) ? readdirSync(dir) : []; }
function packageManager(dir) {
  if (existsSync(join(dir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(dir, 'package-lock.json'))) return 'npm';
  if (existsSync(join(dir, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(dir, 'bun.lockb')) || existsSync(join(dir, 'bun.lock'))) return 'bun';
  if (existsSync(join(dir, 'package.json'))) return 'node-unpinned';
  if (existsSync(join(dir, 'pyproject.toml')) || existsSync(join(dir, 'uv.lock'))) return 'python';
  if (existsSync(join(dir, 'go.mod'))) return 'go';
  if (existsSync(join(dir, 'Cargo.toml'))) return 'rust';
  if (existsSync(join(dir, 'composer.json'))) return 'php';
  return 'unknown';
}
if (!existsSync(join(root, '.git')) || !existsSync(join(root, '.gitmodules'))) {
  console.error(`Workspace preflight failed: expected Git root and .gitmodules under ${root}`);
  process.exit(2);
}
if (!existsSync(join(root, 'repos', 'i2i-yield-watch'))) {
  console.error(`Workspace preflight failed: missing ${join(root, 'repos', 'i2i-yield-watch')}`);
  process.exit(2);
}
const entries = files(reposDir).filter(name => statSync(join(reposDir, name)).isDirectory()).sort();
const inventory = { generatedAt: new Date().toISOString(), root, repositories: [] };
for (const name of entries) {
  const dir = join(reposDir, name);
  const nested = files(dir).filter(x => x === '.gitmodules');
  const status = git(['status', '--porcelain'], dir);
  inventory.repositories.push({
    name,
    path: `repos/${name}`,
    git: existsSync(join(dir, '.git')),
    remote: git(['remote', 'get-url', 'origin'], dir),
    branch: git(['branch', '--show-current'], dir),
    head: git(['rev-parse', 'HEAD'], dir),
    dirty: status ? status.split(/\r?\n/).filter(Boolean).length : 0,
    packageManager: packageManager(dir),
    workflows: existsSync(join(dir, '.github', 'workflows')) ? files(join(dir, '.github', 'workflows')).sort() : [],
    nestedSubmodules: nested,
    tests: ['pytest', 'vitest', 'jest', 'go test', 'cargo test'].filter(x => x === 'pytest' ? existsSync(join(dir, 'pyproject.toml')) : x === 'vitest' || x === 'jest' ? existsSync(join(dir, 'package.json')) : x === 'go test' ? existsSync(join(dir, 'go.mod')) : existsSync(join(dir, 'Cargo.toml'))),
  });
}
writeFileSync(output, JSON.stringify(inventory, null, 2) + '\n');
console.log(`Audited ${inventory.repositories.length} repositories -> ${output}`);
