#!/usr/bin/env bash
# Supabase publishes its own images in its official ECR Public registry too.
set -euo pipefail
stack=${SANATPISH_STATE_DIR:-/opt/sanatpish-selfhosted}/stack
while read -r image; do
  alternate="public.ecr.aws/$image"
  docker pull "$alternate"
  docker tag "$alternate" "$image"
done < <(sed -n 's/^[[:space:]]*image: \(supabase\/[^[:space:]]*\).*$/\1/p' "$stack/docker-compose.yml")
echo 'Official Supabase images downloaded. Non-Supabase images still use their vendor source.'
