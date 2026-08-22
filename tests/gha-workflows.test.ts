/**
 * Tests for GitHub Actions workflow files.
 *
 * Validates structure, security best practices, required fields,
 * and consistency across all workflow YAML files. Uses regex-based
 * YAML validation (no external YAML parser dependency).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const WORKFLOWS_DIR = resolve(process.cwd(), '.github/workflows')

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function loadWorkflow(filename: string): string {
  return readFileSync(join(WORKFLOWS_DIR, filename), 'utf8')
}

function listWorkflowFiles(): string[] {
  if (!existsSync(WORKFLOWS_DIR)) return []
  return readdirSync(WORKFLOWS_DIR).filter(
    (f) => f.endsWith('.yml') || f.endsWith('.yaml'),
  )
}

/** Check YAML has a top-level key (name, on, jobs, etc.) */
function hasTopLevelKey(yaml: string, key: string): boolean {
  const re = new RegExp(`^${key}:\\s`, 'm')
  return re.test(yaml)
}

/** Check if any step uses a given action */
function usesAction(yaml: string, actionPattern: string): boolean {
  return yaml.includes(actionPattern)
}

/** Extract node version from setup-node step */
function getNodeVersion(yaml: string): number | null {
  // Match `node-version: '22'` or `node-version: 22` or node-version: 22
  const m = yaml.match(/node-version:\s*['"]?(\d+)['"]?/)
  return m ? parseInt(m[1], 10) : null
}

/** Check YAML has a concurrency group containing a substring */
function hasConcurrencyGroup(yaml: string, contains?: string): boolean {
  if (!hasTopLevelKey(yaml, 'concurrency')) return false
  if (!contains) return true
  const m = yaml.match(/group:\s*(.+)/)
  return m ? m[1].includes(contains) : false
}

/* ------------------------------------------------------------------ */
/*  Tests                                                             */
/* ------------------------------------------------------------------ */

describe('GHA workflow files exist', () => {
  it('has at least one workflow file', () => {
    expect(listWorkflowFiles().length).toBeGreaterThan(0)
  })

  it('has deploy, test, and gh-pages-info workflows', () => {
    const files = listWorkflowFiles()
    expect(files).toContain('deploy.yml')
    expect(files).toContain('test.yml')
    expect(files).toContain('gh-pages-info.yml')
  })
})

describe('all workflow YAML validity', () => {
  for (const file of listWorkflowFiles()) {
    it(`${file} has required top-level keys (name, on, jobs)`, () => {
      const yaml = loadWorkflow(file)
      expect(hasTopLevelKey(yaml, 'name')).toBe(true)
      // 'on' is special in YAML - it may be quoted
      expect(yaml).toMatch(/^on:/m)
      expect(hasTopLevelKey(yaml, 'jobs')).toBe(true)
    })
  }
})

describe('deploy.yml', () => {
  const yaml = loadWorkflow('deploy.yml')

  it('is named "deploy"', () => {
    expect(yaml).toMatch(/^name:\s*deploy$/m)
  })

  it('triggers on push to main', () => {
    expect(yaml).toMatch(/push:/)
    expect(yaml).toMatch(/branches:\s*\[main\]/)
  })

  it('supports workflow_dispatch', () => {
    expect(yaml).toMatch(/workflow_dispatch/)
  })

  it('has concurrency group preventing parallel deploys', () => {
    expect(hasConcurrencyGroup(yaml, 'deploy')).toBe(true)
  })

  it('has cancel-in-progress', () => {
    expect(yaml).toMatch(/cancel-in-progress:\s*true/)
  })

  it('uses actions/checkout@v4', () => {
    expect(usesAction(yaml, 'actions/checkout@v4')).toBe(true)
  })

  it('uses actions/setup-node', () => {
    expect(usesAction(yaml, 'actions/setup-node')).toBe(true)
  })

  it('uses node 22', () => {
    expect(getNodeVersion(yaml)).toBe(22)
  })

  it('checks submodule integrity', () => {
    expect(yaml).toMatch(/check:submodules/)
  })

  it('resolves file deps before install', () => {
    expect(yaml).toMatch(/Resolve file deps/)
    expect(yaml).toMatch(/sed -i/)
  })

  it('installs with --legacy-peer-deps', () => {
    expect(yaml).toMatch(/--legacy-peer-deps/)
  })

  it('runs npm run build', () => {
    expect(yaml).toMatch(/npm run build/)
  })

  it('deploys to Cloudflare Pages via wrangler', () => {
    expect(usesAction(yaml, 'cloudflare/wrangler-action')).toBe(true)
    expect(yaml).toMatch(/pages deploy dist/)
    expect(yaml).toMatch(/project-name=oriz-tts/)
  })

  it('has read-only contents permission', () => {
    expect(yaml).toMatch(/permissions:/)
    expect(yaml).toMatch(/contents:\s*read/)
  })

  it('does not hardcode secrets', () => {
    // Secrets should be referenced via ${{ secrets.X }}
    expect(yaml).not.toMatch(/ghp_[A-Za-z0-9]{36}/)
    expect(yaml).not.toMatch(/sk-[A-Za-z0-9]{48}/)
  })
})

describe('test.yml', () => {
  const yaml = loadWorkflow('test.yml')

  it('is named "test"', () => {
    expect(yaml).toMatch(/^name:\s*test$/m)
  })

  it('triggers on push to main and pull_request', () => {
    expect(yaml).toMatch(/push:/)
    expect(yaml).toMatch(/branches:\s*\[main\]/)
    expect(yaml).toMatch(/pull_request:/)
  })

  it('supports workflow_dispatch', () => {
    expect(yaml).toMatch(/workflow_dispatch/)
  })

  it('has concurrency group with cancel-in-progress', () => {
    expect(hasConcurrencyGroup(yaml, 'test')).toBe(true)
    expect(yaml).toMatch(/cancel-in-progress:\s*true/)
  })

  it('uses actions/checkout@v4', () => {
    expect(usesAction(yaml, 'actions/checkout@v4')).toBe(true)
  })

  it('uses node 22', () => {
    expect(getNodeVersion(yaml)).toBe(22)
  })

  it('resolves file deps before install', () => {
    expect(yaml).toMatch(/Resolve file deps/)
  })

  it('runs npm run test (vitest)', () => {
    expect(yaml).toMatch(/npm run test/)
  })

  it('has read-only permissions', () => {
    expect(yaml).toMatch(/contents:\s*read/)
  })
})

describe('gh-pages-info.yml', () => {
  const yaml = loadWorkflow('gh-pages-info.yml')

  it('is named "Deploy info page to GitHub Pages"', () => {
    expect(yaml).toMatch(/name:\s*Deploy info page to GitHub Pages/)
  })

  it('triggers on push to main with gh-info path filter', () => {
    expect(yaml).toMatch(/push:/)
    expect(yaml).toMatch(/branches:\s*\[main\]/)
    expect(yaml).toMatch(/paths:/)
    expect(yaml).toMatch(/gh-info/)
  })

  it('triggers on workflow_dispatch', () => {
    expect(yaml).toMatch(/workflow_dispatch/)
  })

  it('has contents:write permission for gh-pages push', () => {
    expect(yaml).toMatch(/permissions:/)
    expect(yaml).toMatch(/contents:\s*write/)
  })

  it('has concurrency group', () => {
    expect(hasConcurrencyGroup(yaml, 'gh-pages')).toBe(true)
    expect(yaml).toMatch(/cancel-in-progress:\s*true/)
  })

  it('uses peaceiris/actions-gh-pages@v4', () => {
    expect(usesAction(yaml, 'peaceiris/actions-gh-pages@v4')).toBe(true)
  })

  it('publishes ./gh-info directory', () => {
    expect(yaml).toMatch(/publish_dir:\s*\.\/gh-info/)
  })

  it('publishes to gh-pages branch', () => {
    expect(yaml).toMatch(/publish_branch:\s*gh-pages/)
  })

  it('uses force_orphan for clean gh-pages', () => {
    expect(yaml).toMatch(/force_orphan:\s*true/)
  })
})

describe('cross-workflow consistency', () => {
  const allYaml = listWorkflowFiles().map((f) => ({
    file: f,
    yaml: loadWorkflow(f),
  }))

  it('all workflows use actions/checkout@v4', () => {
    for (const { file, yaml } of allYaml) {
      expect(usesAction(yaml, 'actions/checkout@v4'), `${file} missing checkout@v4`).toBe(true)
    }
  })

  it('all workflows with Node use the same version (22)', () => {
    for (const { file, yaml } of allYaml) {
      const ver = getNodeVersion(yaml)
      if (ver !== null) {
        expect(ver, `${file} uses Node ${ver} instead of 22`).toBe(22)
      }
    }
  })

  it('all workflows have concurrency groups', () => {
    for (const { file, yaml } of allYaml) {
      expect(hasTopLevelKey(yaml, 'concurrency'), `${file} missing concurrency`).toBe(true)
    }
  })
})

describe('security: no hardcoded secrets', () => {
  for (const file of listWorkflowFiles()) {
    const yaml = loadWorkflow(file)

    it(`${file} has no hardcoded GitHub PATs`, () => {
      expect(yaml).not.toMatch(/ghp_[A-Za-z0-9]{36}/)
    })

    it(`${file} has no hardcoded OpenAI keys`, () => {
      expect(yaml).not.toMatch(/sk-[A-Za-z0-9]{48}/)
    })

    it(`${file} has no hardcoded Slack tokens`, () => {
      expect(yaml).not.toMatch(/xoxb-[A-Za-z0-9]/)
    })

    it(`${file} has no hardcoded Google API keys`, () => {
      expect(yaml).not.toMatch(/\bAIza[A-Za-z0-9_-]{35}\b/)
    })
  }
})
