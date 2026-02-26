"""
OAuth preflight helper.

Purpose:
- Print the *exact* client_id + redirect_uri used to build the OAuth authorize URL.
- This is the fastest way to debug Google `redirect_uri_mismatch` without DevTools.

Safe to run locally: it never prints client secrets.
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
import json
from urllib.parse import parse_qs, urlparse


def _ensure_import_path() -> None:
    here = Path(__file__).resolve()
    repo_root = here.parents[3]  # .../app/backend/scripts -> repo root
    app_dir = repo_root / "app"
    backend_dir = repo_root / "app" / "backend"
    for p in (repo_root, app_dir, backend_dir):
        sp = str(p)
        if sp not in sys.path:
            sys.path.insert(0, sp)


def _mask_secret(val: str | None) -> str:
    if not val:
        return "<EMPTY>"
    return "<SET>"


def main() -> int:
    parser = argparse.ArgumentParser(description="Print effective OAuth authorize URL params")
    parser.add_argument("--provider", default="google", help="OAuth provider (default: google)")
    parser.add_argument(
        "--frontend-redirect",
        default=None,
        help="Frontend URL/origin to embed into state (default: APP_FRONTEND_BASE_URL or http://localhost:3000)",
    )
    parser.add_argument(
        "--envfile",
        default=None,
        help="Env file path (sets APP_ENVFILE before importing backend settings)",
    )
    parser.add_argument(
        "--env-json",
        default=None,
        help="JSON env file (e.g. app/backend/env_test.json). Values override process env for this run.",
    )
    parser.add_argument(
        "--allow-missing-secret",
        action="store_true",
        help=(
            "If the provider client secret is missing, set a placeholder so we can still "
            "print the authorize URL. (Callback will still fail without the real secret.)"
        ),
    )
    args = parser.parse_args()

    if args.env_json:
        payload = json.loads(Path(args.env_json).read_text(encoding="utf-8"))
        if not isinstance(payload, dict):
            raise SystemExit("--env-json must contain a JSON object")
        for k, v in payload.items():
            if v is None:
                continue
            os.environ[str(k)] = str(v)

    if args.envfile:
        os.environ["APP_ENVFILE"] = args.envfile

    _ensure_import_path()

    # Import only after setting APP_ENVFILE so settings loads the right env.
    from backend.services.auth_service import build_login_url, _get_redirect_uri, get_provider  # noqa: WPS433
    import backend.settings as backend_settings  # noqa: WPS433

    provider = str(args.provider).strip().lower()
    frontend_redirect = (
        args.frontend_redirect
        or os.getenv("APP_FRONTEND_BASE_URL")
        or "http://localhost:3000"
    )

    print("== OAuth Preflight ==")
    print("APP_ENV:", os.getenv("APP_ENV", ""))
    print("APP_ENVFILE:", os.getenv("APP_ENVFILE", ""))
    print("settings.chosen_env:", getattr(backend_settings, "chosen_env", ""))
    print("provider:", provider)
    print("frontend_redirect (state.redirect):", frontend_redirect)
    print()

    prov = get_provider(provider)
    secret_key_app = f"APP_{prov.client_secret_env}"
    secret_val = os.getenv(secret_key_app) or os.getenv(prov.client_secret_env)

    # We must *not* print secrets. Validate presence; optionally allow placeholder.
    try:
        client_id, _ = prov.get_credentials()
    except Exception:
        if args.allow_missing_secret and not secret_val:
            os.environ[secret_key_app] = "placeholder-secret-for-preflight"
            secret_val = os.environ[secret_key_app]
            client_id, _ = prov.get_credentials()
        else:
            raise

    redirect_uri = _get_redirect_uri(provider)
    auth_url = build_login_url(provider, frontend_redirect)

    parsed = urlparse(auth_url)
    params = parse_qs(parsed.query)
    redirect_uri_from_url = (params.get("redirect_uri") or [""])[0]

    print("client_id:", client_id)
    print("client_secret:", _mask_secret(secret_val))
    print("resolved_redirect_uri:", redirect_uri)
    print("redirect_uri_in_authorize_url:", redirect_uri_from_url)
    print()
    print("Authorize URL (open this in a browser to reproduce):")
    print(auth_url)
    print()
    print("Google Console should include EXACTLY this under Authorized redirect URIs:")
    print("-", redirect_uri_from_url)
    print()
    if redirect_uri_from_url != redirect_uri:
        print("WARNING: redirect_uri mismatch between resolver and built URL.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
