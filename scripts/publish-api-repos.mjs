#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(process.env.WORKSPACE_ROOT || process.cwd());
const catalog = JSON.parse(readFileSync(join(root, 'scripts', 'api-catalog.json'), 'utf8'));
const pilot = new Set(catalog.pilot);
const publishPilot = process.argv.includes('--pilot');
const publishAll = process.argv.includes('--all');
if (!publishPilot && !publishAll) {
  console.error('Usage: node scripts/publish-api-repos.mjs --pilot|--all');
  process.exit(2);
}

function run(command, args, cwd = root) {
  return execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
}
function hasRemote(name) {
  try { run('gh', ['repo', 'view', `chirag127/${name}`]); return true; } catch { return false; }
}
function addSubmodule(name) {
  const path = `repos/${name}`;
  const declared = readFileSync(join(root, '.gitmodules'), 'utf8').includes(`path = ${path}`);
  if (declared) return;
  const source = join(root, path);
  const backup = join(root, 'repos', `.${name}.publish-backup`);
  if (existsSync(backup)) rmSync(backup, { recursive: true, force: true });
  renameSync(source, backup);
  try {
    run('git', ['submodule', 'add', `https://github.com/chirag127/${name}.git`, path]);
    rmSync(backup, { recursive: true, force: true });
  } catch (error) {
    if (existsSync(source)) rmSync(source, { recursive: true, force: true });
    renameSync(backup, source);
    throw error;
  }
}

const ids = catalog.catalog.map(x => x.id).filter(id => publishAll || pilot.has(id));
for (const id of ids) {
  const dir = join(root, 'repos', id);
  if (!existsSync(dir)) { console.error(`missing generated repo: ${dir}`); process.exitCode = 1; continue; }
  if (existsSync(join(dir, '.git'))) {
    const remote = run('git', ['remote', 'get-url', 'origin'], dir);
    if (remote && !remote.includes(`chirag127/${id}`)) {
      console.error(`refusing unexpected remote for ${id}: ${remote}`);
      process.exitCode = 1;
      continue;
    }
  } else {
    run('git', ['init', '-b', 'main'], dir);
    run('git', ['config', 'user.name', 'github-actions[bot]'], dir);
    run('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com'], dir);
  }
  const dirty = run('git', ['status', '--porcelain'], dir);
  if (dirty) {
    run('git', ['add', '-A'], dir);
    run('git', ['commit', '-m', 'feat: initial static API scaffold'], dir);
  }
  if (!run('git', ['log', '-1', '--oneline'], dir)) {
    console.error(`refusing empty repository: ${id}`);
    process.exitCode = 1;
    continue;
  }
  if (!hasRemote(id)) {
    run('gh', ['repo', 'create', `chirag127/${id}`, '--public', '--description', `Static JSON API - ${id}`, '--source', dir]);
  }
  const remotes = run('git', ['remote'], dir).split(/\r?\n/).filter(Boolean);
  if (!remotes.includes('origin')) run('git', ['remote', 'add', 'origin', `https://github.com/chirag127/${id}.git`], dir);
  run('git', ['push', '-u', 'origin', 'main'], dir);
  addSubmodule(id);
  console.log(`published ${id}`);
}
run('git', ['add', '.gitmodules', ...ids.map(id => `repos/${id}`)]);
console.log(`Published and registered ${ids.length} API repositories.`);
