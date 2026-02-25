"""
Firebase Authentication Provider

This module handles Firebase Authentication integration for user authentication,
while Firestore (via firestore.py) handles user data storage (roles, status, etc.).

Architecture:
- Firebase Auth: Manages Google OAuth, tokens, user authentication
- Firestore: Stores user profile data (roles, status, credits, metadata)
"""

import os
import logging
from typing import Optional, Dict, Any
from functools import lru_cache

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, status

logger = logging.getLogger("uvicorn.error")

_firebase_app: Optional[firebase_admin.App] = None


def _is_firebase_auth_enabled() -> bool:
    """Check if Firebase Authentication is enabled."""
    return os.getenv("APP_FIREBASE_AUTH_ENABLED", "true").lower() in ("true", "1", "yes")


def _get_firebase_credentials_path() -> Optional[str]:
    """Get the path to Firebase service account credentials."""
    # Try different env vars in order of preference
    cred_path = (
        os.getenv("FIREBASE_CREDENTIALS_PATH") or
        os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or
        os.getenv("APP_FIREBASE_CREDENTIALS_PATH")
    )
    
    if cred_path and os.path.exists(cred_path):
        logger.info(f"Using Firebase credentials from: {cred_path}")
        return cred_path
    
    # Try default location
    default_path = os.path.join(os.path.dirname(__file__), "../../firestore-access.json")
    if os.path.exists(default_path):
        logger.info(f"Using Firebase credentials from default location: {default_path}")
        return default_path
    
    logger.warning("No Firebase credentials file found")
    return None


def initialize_firebase_app() -> Optional[firebase_admin.App]:
    """
    Initialize Firebase Admin SDK.
    
    This should be called once at application startup.
    Uses the same credentials as Firestore for consistency.
    """
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    if not _is_firebase_auth_enabled():
        logger.warning("Firebase Authentication is disabled")
        return None
    
    try:
        # Check if running in GCP managed environment
        is_gcp_managed = any([
            os.getenv('K_SERVICE'),  # Cloud Run
            os.getenv('K_REVISION'),  # Cloud Run
            os.getenv('FUNCTION_TARGET'),  # Cloud Functions
            os.getenv('GAE_ENV'),  # App Engine
        ])
        
        # Get project ID from environment
        project_id = (
            os.getenv('APP_GOOGLE_PROJECT_ID') or
            os.getenv('GOOGLE_CLOUD_PROJECT') or
            os.getenv('GCP_PROJECT') or
            os.getenv('GCLOUD_PROJECT')
        )
        
        # Try to use service account file first
        cred_path = _get_firebase_credentials_path()
        
        if cred_path:
            # Use service account file
            logger.info(f"Initializing Firebase Admin SDK with service account from {cred_path}")
            cred = credentials.Certificate(cred_path)
            options = {'projectId': project_id} if project_id else None
            _firebase_app = firebase_admin.initialize_app(cred, options=options)
        elif is_gcp_managed or project_id:
            # Use Application Default Credentials
            logger.info(f"Initializing Firebase Admin SDK with Application Default Credentials (project: {project_id})")
            options = {'projectId': project_id} if project_id else None
            _firebase_app = firebase_admin.initialize_app(options=options)
        else:
            logger.error("Cannot initialize Firebase: no credentials or project ID found")
            logger.error("Set APP_GOOGLE_PROJECT_ID or provide GOOGLE_APPLICATION_CREDENTIALS")
            return None
        
        logger.info("Firebase Admin SDK initialized successfully")
        return _firebase_app
        
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None


def get_firebase_app() -> firebase_admin.App:
    """
    Get the initialized Firebase app instance.
    
    Returns:
        Firebase app instance
        
    Raises:
        RuntimeError: If Firebase is not initialized
    """
    if _firebase_app is None:
        raise RuntimeError("Firebase Admin SDK not initialized. Call initialize_firebase_app() first.")
    return _firebase_app


async def verify_firebase_token(id_token: str) -> Dict[str, Any]:
    """
    Verify a Firebase ID token from the frontend.
    
    Args:
        id_token: The Firebase ID token to verify
        
    Returns:
        Decoded token payload with user information
        
    Raises:
        HTTPException: If token is invalid or verification fails
    """
    if not _is_firebase_auth_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase Authentication is not enabled"
        )
    
    try:
        # Verify the ID token and decode it
        decoded_token = auth.verify_id_token(id_token)
        
        logger.debug(f"Token verified for user: {decoded_token.get('uid')}")
        
        return decoded_token
        
    except auth.InvalidIdTokenError as e:
        logger.warning(f"Invalid Firebase ID token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except auth.ExpiredIdTokenError as e:
        logger.warning(f"Expired Firebase ID token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired"
        )
    except Exception as e:
        logger.error(f"Error verifying Firebase token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


async def get_firebase_user(uid: str) -> Dict[str, Any]:
    """
    Get user information from Firebase Authentication.
    
    Args:
        uid: Firebase user ID
        
    Returns:
        User record from Firebase Auth
        
    Raises:
        HTTPException: If user not found or error occurs
    """
    try:
        user_record = auth.get_user(uid)
        
        return {
            "uid": user_record.uid,
            "email": user_record.email,
            "email_verified": user_record.email_verified,
            "display_name": user_record.display_name,
            "photo_url": user_record.photo_url,
            "provider_id": user_record.provider_id,
            "disabled": user_record.disabled,
            "custom_claims": user_record.custom_claims or {},
        }
        
    except auth.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {uid} not found in Firebase Auth"
        )
    except Exception as e:
        logger.error(f"Error fetching Firebase user {uid}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user information"
        )


async def set_custom_user_claims(uid: str, claims: Dict[str, Any]) -> None:
    """
    Set custom claims on a Firebase user.
    
    This is useful for storing role information in the Firebase token itself.
    However, detailed user data should still be stored in Firestore.
    
    Args:
        uid: Firebase user ID
        claims: Custom claims to set (e.g., {"role": "subscriber", "status": "active"})
    """
    try:
        auth.set_custom_user_claims(uid, claims)
        logger.info(f"Set custom claims for user {uid}: {claims}")
    except Exception as e:
        logger.error(f"Failed to set custom claims for user {uid}: {e}")
        raise


async def revoke_refresh_tokens(uid: str) -> None:
    """
    Revoke all refresh tokens for a user.
    
    This is useful when suspending a user or changing their permissions.
    Forces user to re-authenticate.
    
    Args:
        uid: Firebase user ID
    """
    try:
        auth.revoke_refresh_tokens(uid)
        logger.info(f"Revoked refresh tokens for user {uid}")
    except Exception as e:
        logger.error(f"Failed to revoke tokens for user {uid}: {e}")
        raise


async def delete_firebase_user(uid: str) -> None:
    """
    Delete a user from Firebase Authentication.
    
    Note: This only deletes from Firebase Auth. Firestore data should be
    deleted separately if needed.
    
    Args:
        uid: Firebase user ID
    """
    try:
        auth.delete_user(uid)
        logger.info(f"Deleted Firebase user {uid}")
    except Exception as e:
        logger.error(f"Failed to delete Firebase user {uid}: {e}")
        raise


@lru_cache()
def get_firebase_auth_service():
    """
    Dependency injection helper for Firebase Auth service.
    
    Returns a singleton-like reference to the auth module functions.
    """
    if not _is_firebase_auth_enabled():
        logger.warning("Firebase Authentication is disabled")
        return None
    
    if _firebase_app is None:
        initialize_firebase_app()
    
    return {
        "verify_token": verify_firebase_token,
        "get_user": get_firebase_user,
        "set_custom_claims": set_custom_user_claims,
        "revoke_tokens": revoke_refresh_tokens,
        "delete_user": delete_firebase_user,
    }
