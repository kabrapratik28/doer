#!/bin/bash
set -e

# Supabase database connection
DB_URL="${DATABASE_URL:-postgresql://postgres:4dUV9VFBkA10wqpB4ZJJ@db.guocymbwhackcepkxtcq.supabase.co:5432/postgres}"
PSQL="${PSQL_PATH:-psql}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STEPS_DIR="$SCRIPT_DIR/sql-steps"

echo "=== Supabase Schema Setup ==="
echo "Connecting to database..."
echo ""

for step in "$STEPS_DIR"/step*.sql; do
  step_name=$(basename "$step")
  echo "--- Executing: $step_name ---"
  if "$PSQL" "$DB_URL" -f "$step" 2>&1; then
    echo "[OK] $step_name completed successfully"
  else
    echo "[FAIL] $step_name failed!"
    exit 1
  fi
  echo ""
done

echo "=== All steps completed successfully ==="
