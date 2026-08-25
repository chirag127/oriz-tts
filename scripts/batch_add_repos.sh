#!/usr/bin/env bash
# batch_add_repos.sh — register new repos as submodules at flat repos/<name> paths.
#
# Usage:
#   scripts/batch_add_repos.sh repo1 [repo2 ...]          # add named repos
#   cat new-repos.txt | scripts/batch_add_repos.sh        # read names from stdin (one per line)
#
# Options:
#   -o OWNER    GitHub owner/org for URLs (default: chirag127)
#   -d DIR      Parent directory for submodules (default: repos)
#   -b BRANCH   Track a non-default branch (passed to git submodule add)
#   -f          Force: reuse an existing non-empty dir that isn't registered yet
#   -n          Dry run: show what would be done, change nothing
#   -c          Regenerate README.md catalog afterwards (runs scripts/gen_catalog.cjs)
#   -h          Show help
#
# Names may be bare ("my-repo") or full URLs (https://github.com/owner/my-repo.git).
# Already-registered repos are skipped automatically, so the script is idempotent.

set -euo pipefail

OWNER="chirag127"
DIR="repos"
BRANCH=""
FORCE=0
DRY=0
CATALOG=0

usage() { grep '^#' "$0" | sed 's/^# \{0,1\}//'; }

while getopts "o:d:b:fnch" opt; do
  case "$opt" in
    o) OWNER="$OPTARG" ;;
    d) DIR="$OPTARG" ;;
    b) BRANCH="$OPTARG" ;;
    f) FORCE=1 ;;
    n) DRY=1 ;;
    c) CATALOG=1 ;;
    h) usage; exit 0 ;;
    *) usage; exit 1 ;;
  esac
done
shift $((OPTIND - 1))

# Collect repo args; fall back to stdin only when no args are given
REPOS=("$@")
if [ ${#REPOS[@]} -eq 0 ] && [ ! -t 0 ]; then
  while IFS= read -r line; do
    line="${line%%#*}"                     # strip inline comments
    line="$(echo "$line" | tr -d '[:space:]')"
    [ -n "$line" ] && REPOS+=("$line")
  done
fi

if [ ${#REPOS[@]} -eq 0 ]; then
  echo "No repos given. Pass names as arguments or pipe a list on stdin." >&2
  usage >&2
  exit 1
fi

ADDED=0; SKIPPED=0; FAILED=0

add_one() {
  local spec="$1" name url

  if [[ "$spec" == *://* || "$spec" == git@* ]]; then
    url="$spec"
    name="$(basename "$url" .git)"
  else
    name="$spec"
    url="https://github.com/${OWNER}/${name}.git"
  fi

  local path="${DIR}/${name}"

  # Skip if already registered (idempotent)
  if git config --file .gitmodules --get-regexp "^submodule\\.${path//./\\\\.}\\.path$" >/dev/null 2>&1 \
     || grep -qE "path = ${path}\$" .gitmodules 2>/dev/null; then
    echo "= skip (already registered): $path"; SKIPPED=$((SKIPPED+1)); return 0
  fi

  # Existing unregistered dir needs --force (or is a leftover shell to clean up)
  if [ -e "$path" ]; then
    if [ "$FORCE" -eq 1 ]; then
      echo "! note: reusing existing directory $path (--force)"
    else
      echo "x fail: $path exists but is not registered — inspect it, or rerun with -f to force" >&2
      FAILED=$((FAILED+1)); return 1
    fi
  fi

  local branch_args=()
  [ -n "$BRANCH" ] && branch_args=(-b "$BRANCH")
  local force_args=()
  [ "$FORCE" -eq 1 ] && force_args=(--force)

  if [ "$DRY" -eq 1 ]; then
    echo "+ dry-run: git submodule add ${branch_args[*]} ${force_args[*]} $url $path"
    ADDED=$((ADDED+1)); return 0
  fi

  echo "+ add: $url -> $path"
  if git submodule add "${branch_args[@]}" "${force_args[@]}" "$url" "$path"; then
    ADDED=$((ADDED+1))
  else
    echo "x failed to add $url (does the repo exist / do you have access?)" >&2
    FAILED=$((FAILED+1)); return 1
  fi
}

FAILED_SPECS=()
for spec in "${REPOS[@]}"; do
  add_one "$spec" || FAILED_SPECS+=("$spec")
done

echo
echo "Summary: $ADDED added, $SKIPPED skipped, $FAILED failed (of ${#REPOS[@]})"

if [ "$CATALOG" -eq 1 ] && [ "$DRY" -eq 0 ] && [ "$ADDED" -gt 0 ]; then
  echo "Regenerating README.md catalog..."
  node scripts/gen_catalog.cjs
fi

[ "$FAILED" -gt 0 ] && exit 1
exit 0
