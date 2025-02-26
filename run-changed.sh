#!/bin/bash

set -e  # Exit on error
set -u  # Treat unset variables as an error
set -o pipefail  # Prevents errors in pipelines from being masked

# Check if a command (e.g., "lint" or "test") was passed
if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <command>"
  exit 1
fi

command_name="$1"  # First argument (e.g., "lint", "test", "build")

# Get the list of changed files in the last commit
changed_files=$(git diff --name-only HEAD~1 || echo "")

if [[ -z "$changed_files" ]]; then
  echo "No changed files found."
  exit 0
fi

changed_packages=()

# Find the unique package directories that contain changed files
while IFS= read -r file; do
  package_dir=$(echo "$file" | awk -F'/' '{print $1"/"$2}' | grep '^packages/' || echo "")

  if [[ -n "$package_dir" && -d "$package_dir" ]]; then
    found="false"
    for pkg in "${changed_packages[@]:-}"; do
      if [[ "$pkg" == "$package_dir" ]]; then
        found="true"
        break
      fi
    done
    if [[ "$found" == "false" ]]; then
      changed_packages+=("$package_dir")
    fi
  fi
done <<< "$changed_files"

if [[ ${#changed_packages[@]} -eq 0 ]]; then
  echo "No changed packages found."
  exit 0
fi

# Run command in each package sequentially
for package in "${changed_packages[@]:-}"; do
  package_json="$package/package.json"

  if [[ -f "$package_json" ]]; then
    if grep -q "\"$command_name\"" "$package_json"; then
      echo "Running '$command_name' in $package..."
      cd "$package"
      npm run "$command_name" || yarn "$command_name" || pnpm "$command_name"
      cd - > /dev/null  # Return to original directory without printing
    else
      echo "Skipping $package (no '$command_name' script found)."
    fi
  else
    echo "Skipping $package (package.json not found)."
  fi
done
