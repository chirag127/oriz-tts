import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const guard = resolve(process.cwd(), 'scripts/check-submodules.mjs')
const temporaryDirectories: string[] = []

function createRepository(gitmodules: string, paths: string[] = ['repos/own/example']): string {
  const directory = mkdtempSync(join(tmpdir(), 'oriz-submodule-check-'))
  temporaryDirectories.push(directory)
  execFileSync('git', ['init', '-q'], { cwd: directory })
  execFileSync('git', ['config', 'user.email', 'test@example.invalid'], { cwd: directory })
  execFileSync('git', ['config', 'user.name', 'Submodule Test'], { cwd: directory })
  writeFileSync(join(directory, '.gitmodules'), gitmodules)
  execFileSync('git', ['add', '.gitmodules'], { cwd: directory })
  for (const path of paths) {
    execFileSync(
      'git',
      ['update-index', '--add', '--cacheinfo', `160000,${'1'.repeat(40)},${path}`],
      { cwd: directory },
    )
  }
  execFileSync('git', ['commit', '-qm', 'fixture'], { cwd: directory })
  return directory
}

function runGuard(directory: string) {
  const result = spawnSync(process.execPath, [guard], {
    cwd: directory,
    encoding: 'utf8',
  })
  return {
    status: result.status,
    output: `${result.stdout}${result.stderr}`,
  }
}

afterEach(() => {
  while (temporaryDirectories.length) {
    rmSync(temporaryDirectories.pop()!, { recursive: true, force: true })
  }
})

describe('check-submodules guard', () => {
  it('accepts matching tracked gitlinks and mappings', () => {
    const directory = createRepository(
      '[submodule "example"]\n\tpath = repos/own/example\n\turl = https://example.invalid/example.git\n',
    )
    const result = runGuard(directory)
    expect(result.status).toBe(0)
    expect(result.output).toContain('OK: 1 tracked gitlink(s) match 1 valid .gitmodules mapping(s).')
  })

  it('reports tracked gitlinks missing from .gitmodules', () => {
    const directory = createRepository('[submodule "other"]\n\tpath = other\n\turl = https://example.invalid/other.git\n')
    const result = runGuard(directory)
    expect(result.status).toBe(1)
    expect(result.output).toContain('Missing mappings:')
    expect(result.output).toContain('repos/own/example')
  })

  it('reports mappings that are not tracked gitlinks', () => {
    const directory = createRepository(
      '[submodule "example"]\n\tpath = repos/own/example\n\turl = https://example.invalid/example.git\n[submodule "extra"]\n\tpath = repos/own/extra\n\turl = https://example.invalid/extra.git\n',
      ['repos/own/example'],
    )
    const result = runGuard(directory)
    expect(result.status).toBe(1)
    expect(result.output).toContain('Extra mappings:')
    expect(result.output).toContain('repos/own/extra')
  })

  it('rejects malformed entries and unsafe paths', () => {
    const directory = createRepository(
      '[submodule "example"]\n\tpath = ../outside\n\turl =\n',
    )
    const result = runGuard(directory)
    expect(result.status).toBe(1)
    expect(result.output).toContain('Malformed entries:')
    expect(result.output).toContain('invalid submodule path')
    expect(result.output).toContain('expected exactly one non-empty url setting')
  })
})
