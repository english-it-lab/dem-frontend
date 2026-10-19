#!/bin/sh
set -eu

template_path="/usr/share/nginx/html/config.template.js"
target_path="/usr/share/nginx/html/config.js"

if [ -f "$template_path" ]; then
  envsubst '${VITE_API_BASE_URL} ${VITE_ADMIN_PAGE_ENABLED} ${VITE_AUTH_ENABLED}' \
    < "$template_path" > "$target_path"
fi
