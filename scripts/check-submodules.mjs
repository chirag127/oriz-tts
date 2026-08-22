#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { resolve, isAbsolute } from 'node:path'
import { execFileSync } from 'node:child_process'

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' })
}

function repositoryRoot() {
  return git(['rev-parse', '--show-toplevel'], process.cwd()).trim()
}

function trackedGitlinks(root) {
  const output = git(['ls-files', '--stage', '-z'], root)
  const paths = []

  for (const record of output.split('\0')) {
    if (!record) continue
    const tab = record.indexOf('\t')
    const header = tab === -1 ? record : record.slice(0, tab)
    const path = tab === -1 ? '' : record.slice(tab + 1)
    const mode = header.split(' ', 1)[0]
    if (mode === '160000') paths.push(path)
  }

  return paths.sort()
}

function parseGitmodules(contents) {
  const entries = []
  const errors = []
  let current = null

  for (const [index, rawLine] of contents.split(/\r?\n/).entries()) {
    const lineNumber = index + 1
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith(';')) continue

    const section = line.match(/^\[submodule\s+"([^"]+)"\]$/)
    if (section) {
      if (current) entries.push(current)
      if (!section[1].trim()) {
        errors.push(`line ${lineNumber}: submodule name is empty`)
        current = null
      } else {
        current = { name: section[1], path: [], url: [] }
      }
      continue
    }

    if (line.startsWith('[')) {
      errors.push(`line ${lineNumber}: malformed or unsupported section`)
      current = null
      continue
    }

    const assignment = line.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)\s*=\s*(.*?)\s*$/)
    if (!assignment) {
      errors.push(`line ${lineNumber}: expected key = value`)
      continue
    }
    if (!current) {
      errors.push(`line ${lineNumber}: setting appears outside a submodule section`)
      continue
    }

    const [, key, value] = assignment
    if (key === 'path' || key === 'url') current[key].push({ value, lineNumber })
  }
  if (current) entries.push(current)

  const mappings = []
  const names = new Set()
  const paths = new Map()

  for (const entry of entries) {
    if (names.has(entry.name)) {
      errors.push(`duplicate submodule name: ${entry.name}`)
    }
    names.add(entry.name)

    if (entry.path.length !== 1) {
      errors.push(`${entry.name}: expected exactly one path setting`)
    }
    if (entry.url.length !== 1 || !entry.url[0]?.value) {
      errors.push(`${entry.name}: expected exactly one non-empty url setting`)
    }
    if (entry.path.length !== 1) continue

    const path = entry.path[0].value
    const normalized = path.replaceAll('\\', '/')
    const parts = normalized.split('/')
    if (
      !path ||
      normalized !== path ||
      isAbsolute(path) ||
      path.startsWith('/') ||
      parts.includes('..') ||
      parts.includes('.')
    ) {
      errors.push(`${entry.name}: invalid submodule path: ${path || '<empty>'}`)
      continue
    }
    if (paths.has(path)) errors.push(`duplicate submodule path: ${path}`)
    paths.set(path, entry.name)
    mappings.push({ name: entry.name, path })
  }

  return { mappings, errors }
}

function formatList(label, values) {
  return values.length ? `${label}:\n${values.map((value) => `  - ${value}`).join('\n')}` : ''
}

function main() {
  let root
  try {
    root = repositoryRoot()
  } catch (error) {
    console.error(`Submodule integrity check failed: not a Git repository (${error.message})`)
    process.exitCode = 1
    return
  }

  const gitmodulesPath = resolve(root, '.gitmodules')
  let contents = ''
  try {
    contents = readFileSync(gitmodulesPath, 'utf8')
  } catch (error) {
    const gitlinks = trackedGitlinks(root)
    if (gitlinks.length === 0) {
      console.log('OK: no tracked gitlinks and no .gitmodules file.')
      return
    }
    console.error(`Submodule integrity check failed: cannot read .gitmodules (${error.message})`)
    console.error(formatList('Missing mappings', gitlinks))
    process.exitCode = 1
    return
  }

  const gitlinks = trackedGitlinks(root)
  const { mappings, errors } = parseGitmodules(contents)
  const mappedPaths = new Set(mappings.map(({ path }) => path))
  const trackedPaths = new Set(gitlinks)
  const missing = gitlinks.filter((path) => !mappedPaths.has(path))
  const extra = mappings.map(({ path }) => path).filter((path) => !trackedPaths.has(path))

  if (errors.length || missing.length || extra.length) {
    console.error('Submodule integrity check failed.')
    if (errors.length) console.error(formatList('Malformed entries', errors))
    if (missing.length) console.error(formatList('Missing mappings', missing))
    if (extra.length) console.error(formatList('Extra mappings', extra))
    process.exitCode = 1
    return
  }

  console.log(`OK: ${gitlinks.length} tracked gitlink(s) match ${mappings.length} valid .gitmodules mapping(s).`)
}

main()
