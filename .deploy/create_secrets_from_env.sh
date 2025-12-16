#!/usr/bin/env bash
set -euo pipefail
# Usage: ./create_secrets_from_env.sh [PROJECT] [ENV_FILE] [SERVICE_ACCOUNT]
# Defaults: PROJECT=financial-suite, ENV_FILE=app/backend/.env.development,
# SERVICE_ACCOUNT=295273639887-compute@developer.gserviceaccount.com

PROJECT=${1:-financial-suite}
ENV_FILE=${2:-app/backend/.env.development}
SA=${3:-fund-comparison-run@financial-suite.iam.gserviceaccount.com}

SECRETS=(
  APP_JWT_SECRET_KEY
  APP_JWT_ACCESS_TOKEN_EXPIRE_MINUTES
  APP_GOOGLE_CLIENT_SECRET
  APP_TELEGRAM_BOT_TOKEN
)

if [ ! -f "$ENV_FILE" ]; then
  echo "Env file $ENV_FILE not found. Provide a valid path or create it from .env.development." >&2
  exit 2
fi

echo "Project: $PROJECT"
echo "Env file: $ENV_FILE"
echo "Service account to grant access: $SA"

get_value() {
  key="$1"
  # find first matching line like KEY=... ignoring commented lines
  line=$(grep -E "^\s*${key}=" "$ENV_FILE" | sed -n '1p' || true)
  if [ -z "$line" ]; then
    echo ""
    return
  fi
  val="${line#*=}"
  # strip surrounding single/double quotes if present
  val="${val%\"}"
  val="${val#\"}"
  val="${val%\'}"
  val="${val#\'}"
  # trim whitespace
  echo -n "$(echo -n "$val" | sed -e 's/^\s*//' -e 's/\s*$//')"
}

for s in "${SECRETS[@]}"; do
  v=$(get_value "$s")
  if [ -z "$v" ]; then
    echo "[skip] no value for $s in $ENV_FILE"
    continue
  fi

  if ! gcloud secrets describe "$s" --project="$PROJECT" >/dev/null 2>&1; then
    echo "[create] secret $s"
    gcloud secrets create "$s" --project="$PROJECT" --replication-policy="automatic"
  else
    echo "[exists] secret $s — adding new version"
  fi

  # add the secret value as a new version from stdin
  printf '%s' "$v" | gcloud secrets versions add "$s" --project="$PROJECT" --data-file=-
done

echo "All done. Use :latest in --set-secrets when deploying to Cloud Run."
