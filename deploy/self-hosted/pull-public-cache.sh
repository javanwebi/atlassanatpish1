#!/usr/bin/env bash
# Google Artifact Registry's documented cache of public Docker Hub images.
set -euo pipefail
for image in envoyproxy/envoy:v1.39.1 postgrest/postgrest:v14.18 darthsim/imgproxy:v3.31.4; do
  docker pull "mirror.gcr.io/$image"
  docker tag "mirror.gcr.io/$image" "$image"
done
