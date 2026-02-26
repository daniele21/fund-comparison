#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/deploy/deploy_all.sh --env <test|prod> [--config <path>] [--build-backend]

Options:
  --env            Target environment (test or prod)
  --config         Path to environment config file (default: infra/deploy/environments/<env>.env)
  --build-backend  Build and push backend image before deploying Cloud Run
EOF
}

TARGET_ENV=""
CONFIG_FILE=""
BUILD_BACKEND="false"

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
    --build-backend)
      BUILD_BACKEND="true"
      shift
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

if [[ -z "$CONFIG_FILE" ]]; then
  CONFIG_FILE="infra/deploy/environments/${TARGET_ENV}.env"
fi

backend_args=(--env "$TARGET_ENV" --config "$CONFIG_FILE")
if [[ "$BUILD_BACKEND" == "true" ]]; then
  backend_args+=(--build)
fi

scripts/deploy/deploy_backend.sh "${backend_args[@]}"
scripts/deploy/deploy_frontend.sh --env "$TARGET_ENV" --config "$CONFIG_FILE"
