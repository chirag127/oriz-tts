---
name: gif-search
description: "Search and download GIFs from Tenor via curl + jq. No extra tools needed beyond curl and jq."
version: 1.1.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
prerequisites:
  env_vars: [TENOR_API_KEY]
  commands: [curl, jq]
metadata:
  hermes:
    tags: [GIF, Media, Search, Tenor, API]
---

# GIF Search (Tenor API)

> Ported from Hermes-Agent (Nous Research) 2026-07-08.

Search and download GIFs directly via the Tenor API using curl. No extra tools needed.

## When to use

Finding reaction GIFs, creating visual content, sending GIFs in chat.

## Setup

Set `TENOR_API_KEY` in your environment. Original Hermes path: `${HERMES_HOME:-~/.hermes}/.env`; outside Hermes, use your agent's env mechanism.

```bash
TENOR_API_KEY=your_key_here
```

Get a free API key at https://developers.google.com/tenor/guides/quickstart — the Google Cloud Console Tenor API key is free and has generous rate limits.

## Prerequisites

- `curl` and `jq` (standard on macOS/Linux; Windows via Git Bash or winget)
- `TENOR_API_KEY` environment variable

## Search for GIFs

```bash
# Search and get GIF URLs
curl -s "https://tenor.googleapis.com/v2/search?q=thumbs+up&limit=5&key=${TENOR_API_KEY}" | jq -r '.results[].media_formats.gif.url'

# Get smaller/preview versions
curl -s "https://tenor.googleapis.com/v2/search?q=nice+work&limit=3&key=${TENOR_API_KEY}" | jq -r '.results[].media_formats.tinygif.url'
```

## Download top result

```bash
URL=$(curl -s "https://tenor.googleapis.com/v2/search?q=celebration&limit=1&key=${TENOR_API_KEY}" | jq -r '.results[0].media_formats.gif.url')
curl -sL "$URL" -o celebration.gif
```

## Get full metadata

```bash
curl -s "https://tenor.googleapis.com/v2/search?q=cat&limit=3&key=${TENOR_API_KEY}" | jq '.results[] | {title: .title, url: .media_formats.gif.url, preview: .media_formats.tinygif.url, dimensions: .media_formats.gif.dims}'
```

## API parameters

| Parameter       | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `q`             | Search query (URL-encode spaces as `+`)                    |
| `limit`         | Max results (1-50, default 20)                             |
| `key`           | API key (from `$TENOR_API_KEY` env var)                    |
| `media_filter`  | Filter formats: `gif`, `tinygif`, `mp4`, `tinymp4`, `webm` |
| `contentfilter` | Safety level: `off`, `low`, `medium`, `high`               |
| `locale`        | Language: `en_US`, `es`, `fr`, etc.                        |

## Available media formats

Each result has multiple formats under `.media_formats`:

| Format    | Use case                          |
| --------- | --------------------------------- |
| `gif`     | Full quality GIF                  |
| `tinygif` | Small preview GIF                 |
| `mp4`     | Video version (smaller file size) |
| `tinymp4` | Small preview video               |
| `webm`    | WebM video                        |
| `nanogif` | Tiny thumbnail                    |

## Notes

- URL-encode the query: spaces as `+`, special chars as `%XX`
- For sending in chat, `tinygif` URLs are lighter weight
- GIF URLs can be used directly in markdown: `![alt](url)`
- Hermes-only tool refs (e.g. `channel_send`) not applicable outside Hermes — use your agent's send/reply tool with the URL
