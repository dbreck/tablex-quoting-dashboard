#!/usr/bin/env bash
# Run a SQL file against the dashboard tracker Supabase project (ofweciopslhrepobqpco)
# through the Supabase Management API. Token = the personal PAT registered for the
# `supabase` MCP entry in ~/.claude.json (the only one with privilege on this project).
# Usage: scripts/fin/tracker-sql.sh path/to/file.sql
set -euo pipefail
FILE="${1:?sql file}"
PROJECT="${TRACKER_PROJECT_REF:-ofweciopslhrepobqpco}"
TOK="${SUPABASE_PAT:-$(grep -o 'sbp_2a5d5a[0-9a-f]\{34\}' ~/.claude.json | head -1)}"
python3 - "$FILE" <<'PY' > /tmp/.tracker-sql-body.json
import json,sys; print(json.dumps({"query": open(sys.argv[1]).read()}))
PY
curl -s -w "\nHTTP %{http_code}\n" -X POST \
  -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  --data-binary @/tmp/.tracker-sql-body.json \
  "https://api.supabase.com/v1/projects/$PROJECT/database/query"
rm -f /tmp/.tracker-sql-body.json
