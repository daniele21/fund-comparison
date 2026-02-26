import base64
import json
from types import SimpleNamespace
from urllib.parse import parse_qs, urlparse

import pytest


def _decode_state(state: str) -> dict:
    padded = state + "=" * (-len(state) % 4)
    raw = base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8")
    return json.loads(raw)


def test_build_login_url_embeds_redirect_in_state(monkeypatch):
    # Import inside the test so env monkeypatches apply.
    monkeypatch.setenv("APP_OAUTH_REDIRECT_URI_TEMPLATE", "http://127.0.0.1:8001/auth/{provider}/callback")
    monkeypatch.setenv("APP_GOOGLE_CLIENT_ID", "client-id")
    monkeypatch.setenv("APP_GOOGLE_CLIENT_SECRET", "client-secret")

    from backend.services.auth_service import build_login_url

    frontend_redirect = "https://fund-comparison-0685938029--test-znl7qn0n.web.app"
    url = build_login_url("google", frontend_redirect)
    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    assert params["redirect_uri"] == ["http://127.0.0.1:8001/auth/google/callback"]
    payload = _decode_state(params["state"][0])
    assert payload["redirect"] == frontend_redirect
    assert isinstance(payload["csrf"], str) and payload["csrf"]


def test_oauth_callback_prefers_state_redirect_when_allowed(client, monkeypatch):
    monkeypatch.setenv("APP_CORS_ORIGINS", "https://frontend.example")

    # Patch the imported symbol used by the route handler.
    import backend.routes.auth as auth_routes
    monkeypatch.setattr(auth_routes, "exchange_code", lambda provider, code, state: SimpleNamespace(token="t"))

    # Build a state payload with an allowed redirect origin.
    payload = {"csrf": "x", "redirect": "https://frontend.example"}
    state = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8")).decode("utf-8").rstrip("=")

    res = client.get(f"/auth/google/callback?code=abc&state={state}")
    assert res.status_code == 200
    assert "https://frontend.example" in res.text

