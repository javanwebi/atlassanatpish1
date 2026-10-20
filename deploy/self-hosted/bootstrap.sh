#!/usr/bin/env bash
# Fresh, isolated self-hosted environment. Does not modify managed Supabase or Railway.
set -euo pipefail
umask 077
source_dir=$(cd "$(dirname "$0")/../.." && pwd)
state_dir=${SANATPISH_STATE_DIR:-/opt/sanatpish-selfhosted}
revision=b46b645c6d74316dd5ec0be92bc0f94125917e9b
export SANATPISH_STATE_DIR="$state_dir"
[ "$(id -u)" -eq 0 ] || { echo 'Run as root.' >&2; exit 1; }
command -v docker >/dev/null
compose(){ docker compose --project-name sanatpish-selfhosted --env-file "$state_dir/stack/.env" -f "$state_dir/stack/docker-compose.yml" -f "$source_dir/deploy/self-hosted/compose.override.yml" "$@"; }
case "${1:-help}" in
 prepare)
  if [ -e "$state_dir" ]; then echo 'State directory exists; refusing to overwrite keys or data.' >&2; exit 1; fi
  mkdir -m 700 "$state_dir" "$state_dir/backups"
  git init -q "$state_dir/upstream"
  git -C "$state_dir/upstream" remote add origin https://github.com/supabase/supabase.git
  git -C "$state_dir/upstream" sparse-checkout init --cone
  git -C "$state_dir/upstream" sparse-checkout set docker
  git -C "$state_dir/upstream" fetch --depth 1 origin "$revision"
  git -C "$state_dir/upstream" checkout --detach FETCH_HEAD
  cp -a "$state_dir/upstream/docker" "$state_dir/stack"
  cp "$state_dir/stack/.env.example" "$state_dir/stack/.env"
  (cd "$state_dir/stack" && sh utils/generate-keys.sh --update-env >/dev/null)
  python3 "$source_dir/deploy/self-hosted/configure.py" "$state_dir"
  compose config --quiet
  printf '%s\n' "$revision" > "$state_dir/upstream-revision"
  echo 'Prepared isolated stack; secrets remain in root-only environment files.'
  ;;
 infra)
  compose up -d --wait --wait-timeout 600
  compose ps
  ;;
 schema)
  exists=$(compose exec -T db psql -U postgres -d postgres -Atc "select to_regclass('public.user_profiles') is not null")
  if [ "$exists" != f ]; then echo 'Application schema exists; refusing to overwrite. Use reviewed versioned migrations.' >&2; exit 1; fi
  compose exec -T db pg_dump -U postgres -d postgres -Fc > "$state_dir/backups/before-initial-schema.dump"
  compose exec -T db psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$source_dir/docs/database/sql/Full_Fresh_Database.sql"
  compose exec -T db psql -v ON_ERROR_STOP=1 -U postgres -d postgres -c "select count(*) as public_tables from information_schema.tables where table_schema='public' and table_type='BASE TABLE';"
  echo 'Fresh schema initialized. Business-data import and reconciliation are still required.'
  ;;
 app)
  compose --profile application up -d --wait --wait-timeout 300 app
  curl --fail --show-error http://127.0.0.1:3000/api/health
  echo
  ;;
 status) compose --profile application ps ;;
 *) echo 'Usage: bootstrap.sh prepare|infra|schema|app|status'; exit 1 ;;
esac
