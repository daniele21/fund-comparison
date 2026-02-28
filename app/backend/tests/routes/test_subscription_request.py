from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from schemas.user import UserProfile


@pytest.mark.asyncio
async def test_subscription_request_transitions_user_to_pending_and_notifies_admin(client, monkeypatch):
    existing = UserProfile(
        id="user-1",
        email="user@example.com",
        name="User One",
        plan="free",
        status="active",
        roles=["free"],
        metadata={"foo": "bar"},
    )
    updated = UserProfile(
        id="user-1",
        email="user@example.com",
        name="User One",
        plan="full-access",
        status="pending",
        roles=["subscriber"],
        metadata={"foo": "bar", "subscription_request": {"requested_at": "2026-02-27T00:00:00+00:00", "source": "self_report_banner"}},
    )

    monkeypatch.setattr("api.routes.auth.get_current_user", AsyncMock(return_value={"id": "user-1", "email": "user@example.com"}))
    monkeypatch.setattr("api.routes.auth.create_session_token", lambda **_: "tok_pending")

    get_user_by_id = AsyncMock(side_effect=[existing, updated])
    update_user = AsyncMock()
    monkeypatch.setattr("api.routes.auth.user_service.get_user_by_id", get_user_by_id)
    monkeypatch.setattr("api.routes.auth.user_service.update_user", update_user)

    notifier = AsyncMock()
    notification_service = type("NS", (), {"notify_new_pending_user": notifier})()
    monkeypatch.setattr("api.routes.auth.get_admin_notification_service", lambda: notification_service)

    response = client.post("/auth/subscription/request")

    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["token"] == "tok_pending"
    assert body["user"]["plan"] == "full-access"
    assert body["user"]["status"] == "pending"
    assert body["user"]["roles"] == ["subscriber"]

    update_user.assert_awaited_once()
    args, _ = update_user.call_args
    assert args[0] == "user-1"
    payload = args[1]
    assert payload.plan == "full-access"
    assert payload.status == "pending"
    assert payload.roles == ["subscriber"]
    assert payload.metadata is not None
    assert payload.metadata.get("subscription_request", {}).get("source") == "self_report_banner"

    notifier.assert_awaited_once()


@pytest.mark.asyncio
async def test_subscription_request_is_idempotent_when_already_pending(client, monkeypatch):
    pending = UserProfile(
        id="user-2",
        email="pending@example.com",
        name="Pending User",
        plan="full-access",
        status="pending",
        roles=["subscriber"],
        metadata=None,
    )

    monkeypatch.setattr("api.routes.auth.get_current_user", AsyncMock(return_value={"id": "user-2", "email": "pending@example.com"}))
    monkeypatch.setattr("api.routes.auth.create_session_token", lambda **_: "tok_pending_again")
    monkeypatch.setattr("api.routes.auth.user_service.get_user_by_id", AsyncMock(return_value=pending))
    update_user = AsyncMock()
    monkeypatch.setattr("api.routes.auth.user_service.update_user", update_user)

    notifier = AsyncMock()
    notification_service = type("NS", (), {"notify_new_pending_user": notifier})()
    monkeypatch.setattr("api.routes.auth.get_admin_notification_service", lambda: notification_service)

    response = client.post("/auth/subscription/request")

    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["token"] == "tok_pending_again"
    assert body["user"]["status"] == "pending"

    update_user.assert_not_awaited()
    notifier.assert_not_awaited()
