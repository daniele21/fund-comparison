from fastapi import APIRouter, Depends, Response, Request, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse
import logging
import os
import time
import jwt

from backend.services.auth_service import build_login_url, exchange_code, get_current_user, logout_user, OAUTH_PROVIDERS, get_provider, _get_redirect_uri
from backend.services import user_service
from backend.schemas.user import UserProfileUpdate, UserProfileCreate

try:
    from google.auth.exceptions import DefaultCredentialsError
except Exception:  # pragma: no cover - optional dependency
    DefaultCredentialsError = None  # type: ignore

logger = logging.getLogger("uvicorn.error")
from backend.settings import settings

router = APIRouter()


@router.get("/{provider}/login")
async def oauth_login(provider: str, redirect: str):
    """
    Initiate OAuth flow for any supported provider.
    
    Supported providers: google, github, slack
    
    This endpoint redirects the browser to the provider's OAuth consent screen.
    After the user authorizes, the provider redirects back to /{provider}/callback.
    """
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

        # Exchange auth code for session token
        session = await exchange_code(provider, code, state)

        # Prepare frontend redirect and origin
        frontend_url = getattr(settings, 'FRONTEND_BASE_URL', None)
        if not frontend_url:
                raise HTTPException(status_code=500, detail="Frontend base URL not configured. Set APP_FRONTEND_BASE_URL or settings.FRONTEND_BASE_URL.")

        from urllib.parse import urlparse
        p = urlparse(frontend_url)
        frontend_origin = f"{p.scheme}://{p.netloc}"

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


@router.get("/me")
async def me(request: Request):
    """Get current user information from session."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    plan = user.get("plan")
    try:
        profile = await user_service.get_user_by_id(str(user["id"]))
        if profile and profile.plan:
            plan = profile.plan
    except Exception as exc:
        if DefaultCredentialsError and isinstance(exc, DefaultCredentialsError):
            logger.warning("Skipping Firestore lookup for /auth/me due to missing credentials: %s", exc)
        else:
            logger.exception("Failed to retrieve user profile for plan check", exc_info=True)

    normalized_plan = str(plan or "free").strip().lower().replace(" ", "-")
    if normalized_plan not in {"free", "full-access"}:
        normalized_plan = "free"
    user["plan"] = normalized_plan
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
    jwt_secret = os.getenv("APP_JWT_SECRET", "dev-secret-key")
    jwt_algorithm = "HS256"
    jwt_expire_minutes = 60

    auth_config = settings.auth_config
    if auth_config and auth_config.jwt:
        jwt_secret = auth_config.jwt.secret_key
        jwt_algorithm = auth_config.jwt.algorithm
        jwt_expire_minutes = auth_config.jwt.access_token_expire_minutes

    issued_at = int(time.time())
    expires_at = issued_at + jwt_expire_minutes * 60
    roles = user.get("roles") or ["user"]

    claims = {
        "sub": user["id"],
        "email": user.get("email"),
        "name": user.get("name"),
        "picture": user.get("picture"),
        "provider": user.get("provider"),
        "roles": roles,
        "plan": new_plan,
        "iat": issued_at,
        "exp": expires_at,
    }

    if auth_config and auth_config.jwt:
        aud = getattr(auth_config.jwt, "audience", None)
        iss = getattr(auth_config.jwt, "issuer", None)
        if aud:
            claims["aud"] = aud
        if iss:
            claims["iss"] = iss

    upgraded_token = jwt.encode(claims, jwt_secret, algorithm=jwt_algorithm)

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
