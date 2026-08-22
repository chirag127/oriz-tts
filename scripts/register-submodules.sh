#!/bin/bash
# Register all unregistered git repos as submodules
set -e

cd /c/g/ws

for dir in repos/own/*/; do
  name=$(basename "$dir")
  
  # Skip if already a submodule
  if grep -q "path = repos/own/$name" .gitmodules 2>/dev/null; then
    echo "SKIP (already submodule): $name"
    continue
  fi
  
  # Skip if not a git repo
  if [ ! -d "$dir/.git" ]; then
    continue
  fi
  
  url=$(cd "$dir" && git remote get-url origin 2>/dev/null)
  if [ -z "$url" ]; then
    echo "SKIP (no remote): $name"
    continue
  fi
  
  commit=$(cd "$dir" && git rev-parse HEAD)
  echo "ADDING: $name ($commit)"
  
  # Temporarily rename the directory
  mv "repos/own/$name" "repos/own/.${name}_tmp"
  
  # Add as submodule (this clones from remote)
  git submodule add "$url" "repos/own/$name" 2>/dev/null || {
    echo "  clone failed, manually registering..."
    # Create the directory and init
    mkdir -p "repos/own/$name"
    git init "repos/own/$name"
    cd "repos/own/$name"
    git remote add origin "$url"
    git fetch origin
    git checkout "$commit"
    cd /c/g/ws
    git rm --cached "repos/own/$name" 2>/dev/null || true
  }
  
  # Now overwrite with our local version (which has the right commit)
  rm -rf "repos/own/$name"
  mv "repos/own/.${name}_tmp" "repos/own/$name"
  
  # Update the submodule pointer in the index
  git add "repos/own/$name"
  
  echo "  DONE: $name"
done

echo "=== All submodules registered ==="
