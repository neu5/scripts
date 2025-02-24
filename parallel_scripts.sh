#!/bin/bash

# Run tasks in parallel
npm run lint & LINT_PID=$!
npm test & TEST_PID=$!
npm run flow & FLOW_PID=$!
npm run ts & TS_PID=$!

# Wait and capture exit codes
wait $LINT_PID; LINT_EXIT_CODE=$?
wait $TEST_PID; TEST_EXIT_CODE=$?
wait $FLOW_PID; FLOW_EXIT_CODE=$?
wait $TS_PID; TS_EXIT_CODE=$?

# Flag to track overall success/failure
FAILED=0

# Check each task and print an error message if it failed
if [[ $LINT_EXIT_CODE -ne 0 ]]; then
  echo "❌ Linting failed!"
  FAILED=1
fi

if [[ $TEST_EXIT_CODE -ne 0 ]]; then
  echo "❌ Tests failed!"
  FAILED=1
fi

if [[ $FLOW_EXIT_CODE -ne 0 ]]; then
  echo "❌ Flow check failed!"
  FAILED=1
fi

if [[ $TS_EXIT_CODE -ne 0 ]]; then
  echo "❌ TypeScript check failed!"
  FAILED=1
fi

# Exit with failure if any task failed
if [[ $FAILED -ne 0 ]]; then
  echo "❌ One or more tasks failed!"
  exit 1
fi

echo "✅ All tasks passed successfully!"
exit 0
