#!/bin/bash
set -e
set -u
set -o pipefail

command_name="test"  # The script we want to run in each package

# Detect the number of CPU cores to set the maximum number of parallel jobs
if [[ "$OSTYPE" == "darwin"* ]]; then
  max_parallel_jobs=$(sysctl -n hw.ncpu)  # macOS
else
  max_parallel_jobs=$(nproc)  # Linux
fi

echo "Using max_parallel_jobs: $max_parallel_jobs"

running_jobs=0
exit_codes=()

# Loop over every package directory inside the packages folder
for package in packages/*; do
  if [[ -d "$package" ]]; then
    package_json="$package/package.json"
    if [[ -f "$package_json" ]]; then
      # Check if package.json contains the "test" script
      if grep -q "\"$command_name\"" "$package_json"; then
        echo "Running '$command_name' in $package..."
        (
          cd "$package" && (npm run "$command_name" || yarn "$command_name" || pnpm "$command_name")
        ) &
        pid=$!
        exit_codes+=("$pid")
        ((running_jobs++))

        # If we've reached our parallel job limit, wait for one to finish
        if [[ $running_jobs -ge $max_parallel_jobs ]]; then
          if wait -n 2>/dev/null; then
            wait -n  # Use wait -n if available (Linux)
          else
            wait     # Fallback: wait for all if wait -n is unsupported (older macOS versions)
          fi
          ((running_jobs--))
        fi
      else
        echo "Skipping $package (no '$command_name' script found)."
      fi
    else
      echo "Skipping $package (package.json not found)."
    fi
  fi
done

# Wait for any remaining background jobs and collect exit statuses
failed_jobs=0
for pid in "${exit_codes[@]}"; do
  wait "$pid" || ((failed_jobs++))
done

if [[ $failed_jobs -gt 0 ]]; then
  echo "❌ Some tests failed ($failed_jobs). Exiting with error."
  exit 1
fi

echo "✅ All tests completed successfully!"
exit 0
