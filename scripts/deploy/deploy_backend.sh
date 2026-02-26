#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/deploy/deploy_backend.sh --env <test|prod> [--config <path>] [--build]

Options:
  --env       Target environment (test or prod)
  --config    Path to environment config file (default: infra/deploy/environments/<env>.env)
  --build     Build and push image with Cloud Build before deploy
EOF
}

TARGET_ENV=""
CONFIG_FILE=""
DO_BUILD="false"

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
    --build)
      DO_BUILD="true"
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
  GCP_PROJECT_ID
  GCP_REGION
  CLOUD_RUN_SERVICE
  BACKEND_IMAGE
  BACKEND_ENV_VARS_FILE
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required variable in $CONFIG_FILE: $var_name" >&2
    exit 1
  fi
done

if [[ ! -f "$BACKEND_ENV_VARS_FILE" ]]; then
  echo "Backend env vars file not found: $BACKEND_ENV_VARS_FILE" >&2
  exit 1
fi

echo "Using project: $GCP_PROJECT_ID"
gcloud config set project "$GCP_PROJECT_ID" >/dev/null

if [[ "$DO_BUILD" == "true" ]]; then
  echo "Building backend image: $BACKEND_IMAGE"
  gcloud builds submit app/backend --tag "$BACKEND_IMAGE"
fi

deploy_cmd=(
  gcloud run deploy "$CLOUD_RUN_SERVICE"
  --image "$BACKEND_IMAGE"
  --region "$GCP_REGION"
  --env-vars-file "$BACKEND_ENV_VARS_FILE"
)

if [[ "${CLOUD_RUN_ALLOW_UNAUTHENTICATED:-true}" == "true" ]]; then
  deploy_cmd+=(--allow-unauthenticated)
else
  deploy_cmd+=(--no-allow-unauthenticated)
fi

if [[ -n "${CLOUD_RUN_SERVICE_ACCOUNT:-}" ]]; then
  deploy_cmd+=(--service-account "$CLOUD_RUN_SERVICE_ACCOUNT")
fi

if [[ -n "${CLOUD_RUN_MIN_INSTANCES:-}" ]]; then
  deploy_cmd+=(--min-instances "$CLOUD_RUN_MIN_INSTANCES")
fi

if [[ -n "${CLOUD_RUN_MAX_INSTANCES:-}" ]]; then
  deploy_cmd+=(--max-instances "$CLOUD_RUN_MAX_INSTANCES")
fi

if [[ -n "${BACKEND_SECRETS_MAPPING_FILE:-}" ]]; then
  if [[ ! -f "$BACKEND_SECRETS_MAPPING_FILE" ]]; then
    echo "Secrets mapping file not found: $BACKEND_SECRETS_MAPPING_FILE" >&2
    exit 1
  fi

  secrets_arg=""
  while IFS= read -r line; do
    stripped="$(echo "$line" | sed -e 's/^\s*//' -e 's/\s*$//')"
    [[ -z "$stripped" || "${stripped:0:1}" == "#" ]] && continue
    if [[ "$stripped" != *=* ]]; then
      echo "Invalid secrets mapping entry: $stripped" >&2
      exit 1
    fi
    if [[ -z "$secrets_arg" ]]; then
      secrets_arg="$stripped"
    else
      secrets_arg="${secrets_arg},${stripped}"
    fi
  done < "$BACKEND_SECRETS_MAPPING_FILE"

  if [[ -n "$secrets_arg" ]]; then
    deploy_cmd+=(--set-secrets "$secrets_arg")
  fi
fi

echo "Deploying Cloud Run service: $CLOUD_RUN_SERVICE (${TARGET_ENV})"
"${deploy_cmd[@]}"

SERVICE_URL="$(gcloud run services describe "$CLOUD_RUN_SERVICE" --region "$GCP_REGION" --format='value(status.url)')"
echo "Cloud Run URL: $SERVICE_URL"
