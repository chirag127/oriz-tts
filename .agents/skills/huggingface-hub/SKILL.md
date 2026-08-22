---
name: huggingface-hub
description: "HuggingFace hf CLI: search/download/upload models, datasets, Spaces, and Hub infra."
version: 1.0.0
author: Hugging Face
license: MIT
tags: [huggingface, hf, models, datasets, hub, mlops]
platforms: [linux, macos, windows]
---

<!-- Ported from Hermes-Agent (Nous Research) 2026-07-08. -->

# Hugging Face CLI (`hf`) Reference

The `hf` command is the modern command-line interface for interacting with the Hugging Face Hub, providing tools to manage repositories, models, datasets, and Spaces.

> **IMPORTANT:** The `hf` command replaces the now deprecated `huggingface-cli` command.

## Quick Start

- **Installation:** `curl -LsSf https://hf.co/cli/install.sh | bash -s`
- **Help:** Use `hf --help` to view all available functions and real-world examples.
- **Authentication:** Recommended via `HF_TOKEN` environment variable or the `--token` flag.

---

## Core Commands

### General Operations

- `hf download REPO_ID` — download files from the Hub.
- `hf upload REPO_ID` — upload files/folders (recommended for single-commit).
- `hf upload-large-folder REPO_ID LOCAL_PATH` — recommended for resumable uploads of large directories.
- `hf sync` — sync files between a local directory and a bucket.
- `hf env` / `hf version` — view environment and version details.

### Authentication (`hf auth`)

- `login` / `logout` — manage sessions using tokens from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
- `list` / `switch` — manage and toggle between multiple stored access tokens.
- `whoami` — identify the currently logged-in account.

### Repository Management (`hf repos`)

- `create` / `delete` — create or permanently remove repositories.
- `duplicate` — clone a model, dataset, or Space to a new ID.
- `move` — transfer a repository between namespaces.
- `branch` / `tag` — manage Git-like references.
- `delete-files` — remove specific files using patterns.

---

## Specialized Hub Interactions

### Datasets & Models

- **Datasets:** `hf datasets list`, `info`, and `parquet` (list parquet URLs).
- **SQL Queries:** `hf datasets sql SQL` — execute raw SQL via DuckDB against dataset parquet URLs.
- **Models:** `hf models list` and `info`.
- **Papers:** `hf papers list` — view daily papers.

### Discussions & Pull Requests (`hf discussions`)

- Manage the lifecycle of Hub contributions: `list`, `create`, `info`, `comment`, `close`, `reopen`, and `rename`.
- `diff` — view changes in a PR.
- `merge` — finalize pull requests.

### Infrastructure & Compute

- **Endpoints:** Deploy and manage Inference Endpoints (`deploy`, `pause`, `resume`, `scale-to-zero`, `catalog`).
- **Jobs:** Run compute tasks on HF infrastructure. Includes `hf jobs uv` for running Python scripts with inline dependencies and `stats` for resource monitoring.
- **Spaces:** Manage interactive apps. Includes `dev-mode` and `hot-reload` for Python files without full restarts.

### Storage & Automation

- **Buckets:** Full S3-like bucket management (`create`, `cp`, `mv`, `rm`, `sync`).
- **Cache:** Manage local storage with `list`, `prune` (remove detached revisions), and `verify` (checksum checks).
- **Webhooks:** Automate workflows by managing Hub webhooks (`create`, `watch`, `enable`/`disable`).
- **Collections:** Organize Hub items into collections (`add-item`, `update`, `list`).

---

## Advanced Usage & Tips

### Global Flags

- `--format json` — produces machine-readable output for automation.
- `-q` / `--quiet` — limits output to IDs only.

### Extensions & Skills

- **Extensions:** Extend CLI functionality via GitHub repositories using `hf extensions install REPO_ID`.
- **Skills:** Manage AI assistant skills with `hf skills add`.
