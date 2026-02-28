from typing import Optional
from fastapi import APIRouter, Response, Request, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
import logging
import base64
import json
import os
import re
from urllib.parse import parse_qs, urlparse

from backend.services.auth_service import (
    build_login_url,
    exchange_code,
    get_current_user,
    logout_user,
    OAUTH_PROVIDERS,
    get_provider,
    _get_redirect_uri,
    create_session_token,
)
from backend.services import user_service
from backend.services.admin_notification_service import get_admin_notification_service
from backend.schemas.user import UserProfileUpdate, UserProfileCreate
from config.auth import AuthMode

try:
    from google.auth.exceptions import DefaultCredentialsError
except Exception:  # pragma: no cover - optional dependency
    DefaultCredentialsError = None  # type: ignore

logger = logging.getLogger("uvicorn.error")
from backend.settings import settings

router = APIRouter()


class InviteLoginPayload(BaseModel):
    code: str
    email: Optional[EmailStr] = None
    name: Optional[str] = None


def _normalize_plan_value(value: Optional[str], default: str = "full-access") -> str:
    if not value:
        return default
    normalized = value.strip().lower().replace(" ", "-")
    return normalized or default


def _require_auth_mode(*modes: AuthMode):
    auth_config = settings.auth_config
    if auth_config.auth_mode not in modes:
        raise HTTPException(status_code=404, detail="Endpoint not available for current authentication mode")
    return auth_config


def _decode_state_redirect(state: str) -> Optional[str]:
    """Best-effort decode of redirect URL embedded in OAuth state."""
    if not state:
        return None
    try:
        padded = state + "=" * (-len(state) % 4)
        raw = base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8")
        payload = json.loads(raw)
        redirect = payload.get("redirect")
        return redirect if isinstance(redirect, str) and redirect.strip() else None
    except Exception:
        return None


def _is_allowed_frontend_origin(origin_base: str) -> bool:
    allowed = set(settings.cors_origins or [])
    env_origins = os.getenv("APP_CORS_ORIGINS")
    if env_origins:
        allowed.update(item.strip() for item in env_origins.split(",") if item.strip())

    if origin_base in allowed:
        return True

    origin_regex = os.getenv("APP_CORS_ALLOW_ORIGIN_REGEX")
    return bool(origin_regex and re.match(origin_regex, origin_base))


@router.get("/config")
async def auth_configuration():
    """Expose auth mode details so the frontend can adjust UX."""
    auth_config = settings.auth_config
    google_configured = bool(auth_config.get_oauth_provider("google")) if auth_config else False
    return {
        "mode": auth_config.auth_mode.value if auth_config else AuthMode.GOOGLE.value,
        "google": {
            "enabled": auth_config.auth_mode == AuthMode.GOOGLE if auth_config else True,
            "configured": google_configured,
        },
        "invite": {
            "enabled": auth_config.auth_mode == AuthMode.INVITE_CODE if auth_config else False,
            "requiresEmail": bool(getattr(auth_config, "invitation_requires_email", True)) if auth_config else True,
            "hasCodes": bool(getattr(auth_config, "invitation_codes", []) or []),
            "defaultPlan": getattr(auth_config, "invitation_default_plan", "full-access"),
        },
    }


@router.get("/{provider}/login")
async def oauth_login(provider: str, redirect: str):
    """
    Initiate OAuth flow for any supported provider.
    
    Supported providers: google, github, slack
    
    This endpoint redirects the browser to the provider's OAuth consent screen.
    After the user authorizes, the provider redirects back to /{provider}/callback.
    """
    _require_auth_mode(AuthMode.GOOGLE)

    # Log provider/client info to help debug invalid_client issues
    try:
        prov = get_provider(provider)
        try:
            client_id, _ = prov.get_credentials()
        except HTTPException:
            # credentials missing will be raised by get_credentials; log and re-raise
            logger.error("OAuth credentials missing for provider %s", provider)
            raise
        resolved_redirect = _get_redirect_uri(provider)
        logger.info("OAuth login requested for provider=%s client_id=%s redirect_param=%s resolved_redirect_uri=%s", provider, client_id, redirect, resolved_redirect)
    except Exception:
        # If get_provider or get_credentials failed, let the error propagate after logging
        logger.exception("Error preparing OAuth login for provider %s", provider)
        raise

    auth_url = build_login_url(provider, redirect)
    parsed = urlparse(auth_url)
    query = parse_qs(parsed.query)
    built_client_id = query.get("client_id", [""])[0]
    built_redirect_uri = query.get("redirect_uri", [""])[0]
    logger.info(
        "OAuth authorize URL built provider=%s auth_host=%s client_id=%s redirect_uri=%s redirect_param=%s app_env=%s app_envfile=%s",
        provider,
        parsed.netloc,
        built_client_id,
        built_redirect_uri,
        redirect,
        os.getenv("APP_ENV"),
        os.getenv("APP_ENVFILE"),
    )
    logger.info("Redirecting to OAuth provider URL for %s", provider)
    return RedirectResponse(url=auth_url)


@router.get("/{provider}/callback")
async def oauth_callback(provider: str, code: str, state: str, response: Response):
        """
        Handle OAuth callback from any provider.

        This returns an HTML page that sets the session cookie (so the browser
        receives it) and then notifies the opener window via postMessage and
        closes the popup. If there is no opener it redirects the top-level page
        to the frontend URL.
        """

        _require_auth_mode(AuthMode.GOOGLE)

        logger.info(
            "OAuth callback received provider=%s code_len=%s state_len=%s app_env=%s app_envfile=%s",
            provider,
            len(code or ""),
            len(state or ""),
            os.getenv("APP_ENV"),
            os.getenv("APP_ENVFILE"),
        )

        # Exchange auth code for session token
        session = await exchange_code(provider, code, state)

        # Prepare frontend redirect and origin
        decoded_redirect = _decode_state_redirect(state)
        default_frontend = getattr(settings, 'FRONTEND_BASE_URL', None)
        frontend_url = decoded_redirect or default_frontend
        logger.info(
            "OAuth callback redirect resolution decoded_redirect=%s default_frontend=%s chosen_frontend=%s",
            decoded_redirect,
            default_frontend,
            frontend_url,
        )
        if not frontend_url:
                raise HTTPException(status_code=500, detail="Frontend base URL not configured. Set APP_FRONTEND_BASE_URL or settings.FRONTEND_BASE_URL.")

        p = urlparse(frontend_url)
        frontend_origin = f"{p.scheme}://{p.netloc}"
        if not _is_allowed_frontend_origin(frontend_origin):
            logger.warning(
                "OAuth callback redirect origin not allowed: %s. Falling back to FRONTEND_BASE_URL=%s",
                frontend_origin,
                default_frontend,
            )
            frontend_url = getattr(settings, 'FRONTEND_BASE_URL', None)
            if not frontend_url:
                raise HTTPException(status_code=500, detail="Frontend base URL not configured. Set APP_FRONTEND_BASE_URL or settings.FRONTEND_BASE_URL.")
            p = urlparse(frontend_url)
            frontend_origin = f"{p.scheme}://{p.netloc}"
        logger.info(
            "OAuth callback final frontend target frontend_url=%s frontend_origin=%s",
            frontend_url,
            frontend_origin,
        )

        # NOTE: we include the session token in the postMessage payload so that
        # popup-based flows can receive a token even when cookies are not sent by
        # the browser (common in cross-origin dev). The token is only sent to the
        # configured frontend origin.
        html = f"""
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Authentication complete</title>
            <style>
                body {{
                    font-family: system-ui, -apple-system, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }}
                .message {{
                    text-align: center;
                    padding: 2rem;
                }}
                .message h1 {{
                    margin: 0 0 0.5rem 0;
                    font-size: 1.5rem;
                }}
                .message p {{
                    margin: 0;
                    opacity: 0.9;
                }}
            </style>
        </head>
        <body>
            <div class="message">
                <h1>✅ Authentication complete</h1>
                <p>This window will close automatically...</p>
            </div>
            <script>
                (function() {{
                    console.log('🔔 [Backend Callback] About to send postMessage');
                    console.log('🎯 [Backend Callback] targetOrigin:', '{frontend_origin}');
                    console.log('🪟 [Backend Callback] window.opener exists:', !!window.opener);
                    
                    try {{
                        if (window.opener && !window.opener.closed) {{
                            // Send success message to parent window
                            window.opener.postMessage(
                                {{ type: 'oauth', provider: '{provider}', status: 'success', token: '{session.token}' }}, 
                                '{frontend_origin}'
                            );
                            console.log('✅ [Backend Callback] postMessage sent successfully');
                            
                            // Close popup after a short delay
                            setTimeout(function() {{ 
                                console.log('🚪 [Backend Callback] Closing popup...');
                                window.close(); 
                            }}, 1000);
                        }} else {{
                            console.log('⚠️ [Backend Callback] No window.opener available');
                            console.log('🔄 [Backend Callback] User must close this window manually or use the redirect link');
                            
                            // Show a message with a link instead of auto-redirecting
                            document.body.innerHTML = `
                                <div class="message">
                                    <h1>⚠️ Authentication Complete</h1>
                                    <p>Please close this window and return to the application.</p>
                                    <p style="margin-top: 1rem;">
                                        <a href="{frontend_url}" style="color: white; text-decoration: underline;">
                                            Or click here to return to the app
                                        </a>
                                    </p>
                                </div>
                            `;
                        }}
                    }} catch (e) {{
                        console.error('❌ [Backend Callback] Error in postMessage flow:', e);
                        
                        // Show error message with manual link
                        document.body.innerHTML = `
                            <div class="message">
                                <h1>⚠️ Authentication Complete</h1>
                                <p>Please close this window and return to the application.</p>
                                <p style="margin-top: 1rem;">
                                    <a href="{frontend_url}" style="color: white; text-decoration: underline;">
                                        Or click here to return to the app
                                    </a>
                                </p>
                            </div>
                        `;
                    }}
                }})();
            </script>
        </body>
        </html>
        """

        resp = HTMLResponse(content=html, status_code=200)
        
        # Explicitly set Cross-Origin-Opener-Policy to unsafe-none to allow postMessage
        # This is needed because Google OAuth may set restrictive COOP headers
        resp.headers["Cross-Origin-Opener-Policy"] = "unsafe-none"
        
        # Configure cookie: in production we use Strict; for development we keep
        # it permissive to aid local popup flows. Note: SameSite=None requires
        # Secure in some browsers; if you run into issues in dev prefer the
        # token-in-postMessage approach (the frontend reads the token from the
        # postMessage and sends it as Bearer in Authorization header).
        is_prod = getattr(settings, 'ENV', '').lower() == 'production'
        resp.set_cookie(
            key="session",
            value=session.token,
            httponly=True,
            samesite=("strict" if is_prod else "lax"),
            max_age=60 * 60 * 24 * 7,  # 7 days
            secure=is_prod,
        )
        return resp


@router.post("/invite/login")
async def invite_login(payload: InviteLoginPayload):
    """Authenticate a user via invitation code when invite_code mode is enabled."""
    auth_config = _require_auth_mode(AuthMode.INVITE_CODE)
    codes = {code.strip().lower() for code in auth_config.invitation_codes if code}
    if not codes:
        raise HTTPException(status_code=500, detail="No invitation codes configured")

    provided_code = (payload.code or "").strip().lower()
    if not provided_code or provided_code not in codes:
        raise HTTPException(status_code=401, detail="Invalid invitation code")

    if auth_config.invitation_requires_email and not payload.email:
        raise HTTPException(status_code=400, detail="Email is required to redeem this invitation")

    email_value = (payload.email or f"invitee+{provided_code}@example.com").lower()
    user_id = email_value
    plan_value = _normalize_plan_value(auth_config.invitation_default_plan, "full-access")
    display_name = payload.name or (email_value.split("@")[0] if email_value else "Invited User")

    # Issue session token
    token = create_session_token(
        user_id=user_id,
        email=email_value,
        name=display_name,
        picture=None,
        provider="invite_code",
        roles=["user"],
        plan=plan_value,
    )

    try:
        profile = UserProfileCreate(
            id=user_id,
            email=email_value,
            name=display_name,
            # Plan will be determined by upsert_user based on admin config
        )
        await user_service.upsert_user(profile, mark_login=True)
    except Exception as exc:  # noqa: BLE001
        if DefaultCredentialsError and isinstance(exc, DefaultCredentialsError):
            logger.warning("Skipping Firestore profile upsert during invite login: %s", exc)
        else:
            logger.exception("Failed to persist invite login user", exc_info=True)

    user_payload = {
        "id": user_id,
        "email": email_value,
        "name": display_name,
        "picture": None,
        "roles": ["user"],
        "plan": plan_value,
    }

    resp = JSONResponse({"token": token, "user": user_payload})
    is_prod = getattr(settings, 'ENV', '').lower() == 'production'
    resp.set_cookie(
        key="session",
        value=token,
        httponly=True,
        samesite=("strict" if is_prod else "lax"),
        max_age=60 * 60 * 24 * 7,
        secure=is_prod,
    )
    return resp


@router.get("/me")
async def me(request: Request):
    """Get current user information from session."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    plan = user.get("plan")
    status_value = user.get("status", "active")
    roles = user.get("roles", [])
    
    try:
        profile = await user_service.get_user_by_id(str(user["id"]))
        if profile:
            if profile.plan:
                plan = profile.plan
            if profile.status:
                status_value = profile.status
            if profile.roles:
                roles = profile.roles
    except Exception as exc:
        if DefaultCredentialsError and isinstance(exc, DefaultCredentialsError):
            logger.warning("Skipping Firestore lookup for /auth/me due to missing credentials: %s", exc)
        else:
            logger.exception("Failed to retrieve user profile for plan check", exc_info=True)

    normalized_plan = str(plan or "free").strip().lower().replace(" ", "-")
    if normalized_plan not in {"free", "full-access"}:
        normalized_plan = "free"
    
    user["plan"] = normalized_plan
    user["status"] = status_value
    user["roles"] = roles
    return user


@router.post('/logout')
async def logout(response: Response):
    """Sign out and clear session cookie."""
    logout_user(response)
    return {"ok": True}


@router.post("/upgrade/fake")
async def fake_upgrade(request: Request):
    """Development-only helper to simulate a plan upgrade."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    new_plan = "full-access"

    try:
        user_id = str(user["id"])
        profile = await user_service.get_user_by_id(user_id)
        if profile:
            await user_service.update_user(user_id, UserProfileUpdate(plan=new_plan))
        else:
            email = user.get("email")
            if not email:
                raise HTTPException(status_code=400, detail="Missing email for user")
            payload = UserProfileCreate(
                id=user_id,
                email=email,
                name=user.get("name"),
                picture=user.get("picture"),
                plan=new_plan,
            )
            await user_service.upsert_user(payload, mark_login=False)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        if DefaultCredentialsError and isinstance(exc, DefaultCredentialsError):
            logger.warning("Skipping Firestore update during fake upgrade: %s", exc)
        else:
            logger.exception("Failed to apply fake upgrade", exc_info=True)
            raise HTTPException(status_code=500, detail="Unable to upgrade plan") from exc

    # Refresh session cookie with upgraded plan
    upgraded_token = create_session_token(
        user_id=str(user["id"]),
        email=user.get("email"),
        name=user.get("name"),
        picture=user.get("picture"),
        provider=user.get("provider") or "manual",
        roles=user.get("roles") or ["user"],
        plan=new_plan,
    )

    response = JSONResponse({"plan": new_plan, "token": upgraded_token})

    is_prod = getattr(settings, 'ENV', '').lower() == 'production'
    cookie_name = "session"
    response.set_cookie(
        key=cookie_name,
        value=upgraded_token,
        httponly=True,
        samesite=("strict" if is_prod else "lax"),
        max_age=60 * 60 * 24 * 7,
        secure=is_prod,
    )

    return response


@router.post("/subscription/request")
async def request_subscription_approval(request: Request):
    """
    Self-reported paid flow: the user claims they have completed payment.

    The account is moved to status='pending' (awaiting admin approval) and plan='full-access'.
    """
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = str(user.get("id") or "")
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user id")

    # Prefer Firestore profile state when available.
    existing_profile = await user_service.get_user_by_id(user_id)

    if existing_profile and existing_profile.plan == "full-access" and existing_profile.status == "active":
        # Already fully active, no-op.
        upgraded_token = create_session_token(
            user_id=user_id,
            email=existing_profile.email,
            name=existing_profile.name,
            picture=existing_profile.picture,
            provider=user.get("provider") or "session",
            roles=existing_profile.roles or ["subscriber"],
            plan="full-access",
            extra_claims={"status": "active"},
        )
        resp = JSONResponse(
            {
                "ok": True,
                "token": upgraded_token,
                "user": {
                    "id": existing_profile.id,
                    "email": existing_profile.email,
                    "name": existing_profile.name,
                    "picture": existing_profile.picture,
                    "roles": existing_profile.roles or [],
                    "plan": "full-access",
                    "status": "active",
                },
            }
        )
        is_prod = getattr(settings, "ENV", "").lower() == "production"
        resp.set_cookie(
            key="session",
            value=upgraded_token,
            httponly=True,
            samesite=("strict" if is_prod else "lax"),
            max_age=60 * 60 * 24 * 7,
            secure=is_prod,
        )
        return resp

    if existing_profile and existing_profile.status == "pending":
        # Idempotent: already pending.
        pending_token = create_session_token(
            user_id=user_id,
            email=existing_profile.email,
            name=existing_profile.name,
            picture=existing_profile.picture,
            provider=user.get("provider") or "session",
            roles=existing_profile.roles or ["subscriber"],
            plan="full-access",
            extra_claims={"status": "pending"},
        )
        resp = JSONResponse(
            {
                "ok": True,
                "token": pending_token,
                "user": {
                    "id": existing_profile.id,
                    "email": existing_profile.email,
                    "name": existing_profile.name,
                    "picture": existing_profile.picture,
                    "roles": existing_profile.roles or [],
                    "plan": "full-access",
                    "status": "pending",
                },
            }
        )
        is_prod = getattr(settings, "ENV", "").lower() == "production"
        resp.set_cookie(
            key="session",
            value=pending_token,
            httponly=True,
            samesite=("strict" if is_prod else "lax"),
            max_age=60 * 60 * 24 * 7,
            secure=is_prod,
        )
        return resp

    # Build metadata and persist pending request.
    if existing_profile:
        merged_metadata = dict(existing_profile.metadata or {})
    else:
        merged_metadata = {}

    merged_metadata["subscription_request"] = {
        "requested_at": datetime.now(timezone.utc).isoformat(),
        "source": "self_report_banner",
    }

    updated_profile = None
    if existing_profile:
        # If already full-access but not active (or missing status), still move to pending.
        updated_profile = await user_service.update_user(
            user_id,
            UserProfileUpdate(
                plan="full-access",
                status="pending",
                roles=["subscriber"],
                metadata=merged_metadata,
            ),
        )
    else:
        email = user.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Missing email for user")
        payload = UserProfileCreate(
            id=user_id,
            email=email,
            name=user.get("name"),
            picture=user.get("picture"),
            plan="full-access",
            status="pending",
            roles=["subscriber"],
            metadata=merged_metadata,
        )
        updated_profile = await user_service.upsert_user(payload, mark_login=False)

    if not updated_profile:
        raise HTTPException(status_code=500, detail="Unable to persist subscription request")

    # Notify admin only when transitioning into pending via this endpoint.
    try:
        notification_service = get_admin_notification_service()
        await notification_service.notify_new_pending_user(user=updated_profile, payment_info=None)
    except Exception:  # noqa: BLE001
        logger.exception("Failed to notify admin for subscription request user_id=%s", user_id)

    pending_token = create_session_token(
        user_id=user_id,
        email=updated_profile.email,
        name=updated_profile.name,
        picture=updated_profile.picture,
        provider=user.get("provider") or "session",
        roles=updated_profile.roles or ["subscriber"],
        plan="full-access",
        extra_claims={"status": "pending"},
    )

    resp = JSONResponse(
        {
            "ok": True,
            "token": pending_token,
            "user": {
                "id": updated_profile.id,
                "email": updated_profile.email,
                "name": updated_profile.name,
                "picture": updated_profile.picture,
                "roles": updated_profile.roles or [],
                "plan": "full-access",
                "status": "pending",
            },
        }
    )

    is_prod = getattr(settings, "ENV", "").lower() == "production"
    resp.set_cookie(
        key="session",
        value=pending_token,
        httponly=True,
        samesite=("strict" if is_prod else "lax"),
        max_age=60 * 60 * 24 * 7,
        secure=is_prod,
    )
    return resp


@router.get("/providers")
async def list_providers():
    """List all supported OAuth providers."""
    return {
        "providers": list(OAUTH_PROVIDERS.keys()),
        "details": {
            name: {
                "name": provider.name,
                "scopes": provider.scopes,
            }
            for name, provider in OAUTH_PROVIDERS.items()
        }
    }


@router.get("/debug/token")
async def debug_token(request: Request):
    """Debug endpoint to inspect the current token (development only)."""
    import jwt
    import time
    import os
    
    # Get token from cookie or header
    session_token = request.cookies.get("session")
    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        session_token = auth_header[7:].strip()
    
    if not session_token:
        return {"error": "No token found"}
    
    try:
        # Decode without verification to see what's inside
        unverified = jwt.decode(session_token, options={"verify_signature": False})
        
        # Check expiration
        now = int(time.time())
        exp = unverified.get("exp")
        iat = unverified.get("iat")
        
        return {
            "token_preview": session_token[:50] + "...",
            "claims": unverified,
            "current_time": now,
            "issued_at": iat,
            "expires_at": exp,
            "time_since_issued": now - iat if iat else None,
            "time_until_expiry": exp - now if exp else None,
            "is_expired": now > exp if exp else None,
            "expected_audience": os.getenv("APP_JWT_AUDIENCE", "webapp-factory"),
            "expected_issuer": os.getenv("APP_JWT_ISSUER", "https://api.example.com"),
        }
    except Exception as e:
        return {"error": str(e), "token_preview": session_token[:50] + "..."}
