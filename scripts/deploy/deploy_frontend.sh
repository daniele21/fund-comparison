#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/deploy/deploy_frontend.sh --env <test|prod> [--config <path>]

Options:
  --env       Target environment (test or prod)
  --config    Path to environment config file (default: infra/deploy/environments/<env>.env)
EOF
}

TARGET_ENV=""
CONFIG_FILE=""

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

if [[ "$TARGET_ENV" != "test" && "$TARGET_ENV" != "prod" ]]; then
  echo "--env must be one of: test, prod" >&2
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

required_vars=(
  FIREBASE_PROJECT_ID
  FRONTEND_VITE_API_BASE
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required variable in $CONFIG_FILE: $var_name" >&2
    exit 1
  fi
done

echo "Building frontend for ${TARGET_ENV}"
if [[ -n "${FRONTEND_VITE_PUBLIC_ANALYTICS_KEY:-}" ]]; then
  (
    cd app/frontend
    VITE_API_BASE="$FRONTEND_VITE_API_BASE" \
    VITE_PUBLIC_ANALYTICS_KEY="$FRONTEND_VITE_PUBLIC_ANALYTICS_KEY" \
      pnpm build
  )
else
  (
    cd app/frontend
    VITE_API_BASE="$FRONTEND_VITE_API_BASE" pnpm build
  )
fi

FIREBASE_DEPLOY_MODE="${FIREBASE_DEPLOY_MODE:-live}"

if [[ "$FIREBASE_DEPLOY_MODE" == "channel" ]]; then
  if [[ -z "${FIREBASE_CHANNEL_ID:-}" ]]; then
    echo "FIREBASE_CHANNEL_ID is required when FIREBASE_DEPLOY_MODE=channel" >&2
    exit 1
  fi

  echo "Deploying Hosting preview channel '${FIREBASE_CHANNEL_ID}' on project ${FIREBASE_PROJECT_ID}"
  firebase hosting:channel:deploy "$FIREBASE_CHANNEL_ID" --only hosting --project "$FIREBASE_PROJECT_ID"
else
  echo "Deploying Hosting live on project ${FIREBASE_PROJECT_ID}"
  firebase deploy --only hosting --project "$FIREBASE_PROJECT_ID"
fi
