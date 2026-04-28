#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/deploy/deploy_frontend.sh --env <name> [--config <path>] [--firebase-project <project-id-or-alias>]

Options:
  --env       Target environment name. Defaults config path to infra/deploy/environments/<name>.env
  --config    Path to environment config file (default: infra/deploy/environments/<env>.env)
  --firebase-project
              Override FIREBASE_PROJECT_ID from the config file. Useful for branch-based deploys.
EOF
}

TARGET_ENV=""
CONFIG_FILE=""
FIREBASE_PROJECT_OVERRIDE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      TARGET_ENV="${2:-}"
      shift 2
      ;;
    --config)
      CONFIG_FILE="${2:-}"
      shift 2
      ;;
    --firebase-project)
      FIREBASE_PROJECT_OVERRIDE="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$TARGET_ENV" ]]; then
  echo "--env is required" >&2
  usage
  exit 1
fi

if [[ ! "$TARGET_ENV" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "--env must contain only letters, numbers, dot, underscore, or dash" >&2
  exit 1
fi

if [[ -z "$CONFIG_FILE" ]]; then
  CONFIG_FILE="infra/deploy/environments/${TARGET_ENV}.env"
fi

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Config file not found: $CONFIG_FILE" >&2
  echo "Copy an example first, e.g. infra/deploy/environments/${TARGET_ENV}.env.example -> ${CONFIG_FILE}" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$CONFIG_FILE"

if [[ -n "$FIREBASE_PROJECT_OVERRIDE" ]]; then
  FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_OVERRIDE"
fi

case "${FIREBASE_PROJECT_ID:-}" in
  financial)
    RESOLVED_FIREBASE_PROJECT_ID="financial-suite"
    ;;
  accademia)
    RESOLVED_FIREBASE_PROJECT_ID="accademia-previdenza"
    ;;
  *)
    RESOLVED_FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID:-}"
    ;;
esac

if [[ -n "$FIREBASE_PROJECT_OVERRIDE" || -z "${FRONTEND_VITE_FIREBASE_PROJECT_ID:-}" ]]; then
  FRONTEND_VITE_FIREBASE_PROJECT_ID="$RESOLVED_FIREBASE_PROJECT_ID"
fi

if [[ "$FRONTEND_VITE_FIREBASE_PROJECT_ID" != "$RESOLVED_FIREBASE_PROJECT_ID" ]]; then
  echo "FRONTEND_VITE_FIREBASE_PROJECT_ID (${FRONTEND_VITE_FIREBASE_PROJECT_ID}) must match FIREBASE_PROJECT_ID (${RESOLVED_FIREBASE_PROJECT_ID})" >&2
  exit 1
fi

required_vars=(
  FIREBASE_PROJECT_ID
  FRONTEND_VITE_API_BASE
  FRONTEND_VITE_FIREBASE_PROJECT_ID
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required variable in $CONFIG_FILE: $var_name" >&2
    exit 1
  fi
done

echo "Building frontend for ${TARGET_ENV}"
echo "Using VITE_API_BASE=${FRONTEND_VITE_API_BASE}"
echo "Using VITE_FIREBASE_PROJECT_ID=${FRONTEND_VITE_FIREBASE_PROJECT_ID}"

frontend_env=()
while IFS= read -r var_name; do
  vite_name="${var_name#FRONTEND_}"
  frontend_env+=("${vite_name}=${!var_name}")
done < <(compgen -A variable FRONTEND_VITE_ | sort)

(
  cd app/frontend
  env "${frontend_env[@]}" pnpm build
)

if command -v rg >/dev/null 2>&1; then
  verify_cmd=(rg -q --fixed-strings "${FRONTEND_VITE_API_BASE}" app/frontend/dist)
else
  verify_cmd=(grep -R -q -F "${FRONTEND_VITE_API_BASE}" app/frontend/dist)
fi

if ! "${verify_cmd[@]}"; then
  echo "Frontend build verification failed: expected API base '${FRONTEND_VITE_API_BASE}' not found in dist bundle" >&2
  exit 1
fi
echo "Frontend build verification passed"

FIREBASE_DEPLOY_MODE="${FIREBASE_DEPLOY_MODE:-live}"

if [[ "$FIREBASE_DEPLOY_MODE" == "channel" ]]; then
  if [[ -z "${FIREBASE_CHANNEL_ID:-}" ]]; then
    echo "FIREBASE_CHANNEL_ID is required when FIREBASE_DEPLOY_MODE=channel" >&2
    exit 1
  fi

  echo "Deploying Hosting preview channel '${FIREBASE_CHANNEL_ID}' on project ${FIREBASE_PROJECT_ID}"
  if [[ -n "${FIREBASE_HOSTING_TARGET:-}" ]]; then
    firebase hosting:channel:deploy "$FIREBASE_CHANNEL_ID" --only "$FIREBASE_HOSTING_TARGET" --project "$FIREBASE_PROJECT_ID"
  else
    firebase hosting:channel:deploy "$FIREBASE_CHANNEL_ID" --project "$FIREBASE_PROJECT_ID"
  fi
else
  echo "Deploying Hosting live on project ${FIREBASE_PROJECT_ID}"
  if [[ -n "${FIREBASE_HOSTING_TARGET:-}" ]]; then
    firebase deploy --only "hosting:${FIREBASE_HOSTING_TARGET}" --project "$FIREBASE_PROJECT_ID"
  else
    firebase deploy --only hosting --project "$FIREBASE_PROJECT_ID"
  fi
fi
