COMMIT_MSG=$(git diff --name-only | grep package.json | while read file; do
  name=$(grep '"name"' "$file" | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/')
  version=$(grep '"version"' "$file" | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/')
  echo "$name@$version"
done | sort | paste -sd'\n' -)

git add .
git commit -m "$COMMIT_MSG"
