import os
import logging
from functools import lru_cache
from typing import Optional
import json
from pathlib import Path

from google.cloud import firestore

from ..settings import settings

logger = logging.getLogger("uvicorn.error")

_client: Optional[firestore.Client] = None


# Override GOOGLE_APPLICATION_CREDENTIALS from repo .env at import time if present.
# The user requested that the .env value should override any pre-existing process env.
def _override_google_credentials_from_repo_env() -> None:
    """
    Override GOOGLE_APPLICATION_CREDENTIALS from local .env files for development.
    
    Skips this override when running in GCP managed environments (Cloud Run, etc.)
    where credentials should come from the attached service account.
    """
    env_key = "GOOGLE_APPLICATION_CREDENTIALS"
    
    # Skip override if running in a GCP managed environment
    is_gcp_managed = any([
        os.getenv('K_SERVICE'),  # Cloud Run
        os.getenv('K_REVISION'),  # Cloud Run
        os.getenv('FUNCTION_TARGET'),  # Cloud Functions
        os.getenv('GAE_ENV'),  # App Engine
        os.getenv('GCE_METADATA_HOST'),  # General GCE metadata indicator
    ])
    
    if is_gcp_managed:
        # In GCP managed environments, UNSET any GOOGLE_APPLICATION_CREDENTIALS
        # that may have been set from .env files (e.g., by settings.py).
        # This ensures we use the service account from the metadata service.
        if env_key in os.environ:
            logger.info(
                "Running in GCP managed environment; removing GOOGLE_APPLICATION_CREDENTIALS "
                "env var (was: %s) to use service account from metadata service",
                os.environ[env_key]
            )
            del os.environ[env_key]
        else:
            logger.debug(
                "Running in GCP managed environment; will use service account from metadata service"
            )
        return
    
    # Look for .env.development or .env next to app/backend or parent
    repo_env_paths = [
        Path(__file__).resolve().parent.parent / '.env.development',
        Path(__file__).resolve().parent.parent / '.env',
        Path(__file__).resolve().parent / '.env.development',
        Path(__file__).resolve().parent / '.env',
    ]
    for p in repo_env_paths:
        try:
            if not p.exists():
                continue
            with open(p, 'r') as fh:
                for raw in fh:
                    ln = raw.strip()
                    if not ln or ln.startswith('#') or '=' not in ln:
                        continue
                    k, v = ln.split('=', 1)
                    if k.strip() == env_key:
                        value = v.strip().strip('"').strip("'")
                        os.environ[env_key] = value
                        logger.info("Overrode %s from repo env file %s", env_key, str(p))
                        return
        except Exception:
            continue


# Perform override at import time (but only for local development)
_override_google_credentials_from_repo_env()


def _resolve_project_id() -> str:
    """Resolve the Firestore project ID from settings or environment."""
    # The config system exposes GOOGLE_PROJECT_ID via settings; fall back to env vars
    # Prefer explicit APP_ env var (from .env files) so local overrides work, then settings, then legacy env
    project_id = os.getenv("APP_GOOGLE_PROJECT_ID") or getattr(settings, "GOOGLE_PROJECT_ID", None) or os.getenv("GOOGLE_PROJECT_ID")
    if project_id:
        logger.debug("Resolved Firestore project id from env/settings: %s", project_id)
        return project_id

    # As a final fallback, let Firestore infer project ID (e.g. from credentials)
    inferred = firestore.Client().project
    logger.debug("No explicit Firestore project id found; inferred from credentials: %s", inferred)
    return inferred


def _resolve_database_id() -> str:
    """Resolve the Firestore database id from settings or environment."""
    db_config = getattr(settings, "_database_config", None)
    # Prefer explicit APP env var, then settings value (unless it's the placeholder '(default)'), then legacy env var
    env_db = os.getenv('APP_FIRESTORE_DATABASE_ID') or os.getenv('FIRESTORE_DATABASE_ID')
    if env_db:
        logger.debug("Resolved Firestore database id from env: %s", env_db)
        return env_db

    db_id = None
    if db_config and getattr(db_config, 'firestore', None):
        db_id = getattr(db_config.firestore, 'database_id', None)
    # Treat the placeholder '(default)' as unset
    if db_id and db_id != "(default)":
        logger.debug("Resolved Firestore database id from settings: %s", db_id)
        return db_id

    # Fallback to settings default or literal '(default)'
    fallback = getattr(settings, 'database', None).firestore.database_id if getattr(settings, 'database', None) else '(default)'
    logger.debug("Using fallback Firestore database id: %s", fallback)
    return fallback


def _ensure_emulator_environment():
    """Configure Firestore emulator environment variables when enabled."""
    db_config = getattr(settings, "_database_config", None)
    # If emulator is explicitly disabled, ensure any emulator env vars are removed
    use_emulator = False
    if db_config and getattr(db_config.firestore, "use_emulator", False):
        use_emulator = True

    if not use_emulator:
        # Remove emulator env vars to avoid accidental use of a leftover setting
        removed = False
        for key in ("FIRESTORE_EMULATOR_HOST", "APP_FIRESTORE_EMULATOR_HOST"):
            if key in os.environ:
                os.environ.pop(key, None)
                removed = True
        if removed:
            logger.debug("Firestore emulator disabled in configuration; removed emulator env vars")
        else:
            logger.debug("Firestore emulator not enabled in configuration")
        return

    host = db_config.firestore.emulator_host or os.getenv("FIRESTORE_EMULATOR_HOST")
    if host:
        os.environ.setdefault("FIRESTORE_EMULATOR_HOST", host)
        logger.info("Configured Firestore emulator host: %s", host)


def _ensure_credentials_fallback():
    """Ensure GOOGLE_APPLICATION_CREDENTIALS points to a valid credentials file.

    If the environment variable is unset or points to a non-existing file, and a
    repo-local `firestore-access.json` exists, set GOOGLE_APPLICATION_CREDENTIALS
    to that path. This is a convenience for local development only.
    
    In production environments (Cloud Run, GCE, etc.), the application should rely
    on the attached service account for authentication. This function detects such
    environments and skips the file search to avoid unnecessary errors.
    """
    env_key = "GOOGLE_APPLICATION_CREDENTIALS"

    # Detect if we're running in a GCP managed environment (Cloud Run, GCE, etc.)
    # where credentials come from the metadata service via the attached service account.
    # In these cases, skip the file search entirely.
    is_gcp_managed = any([
        os.getenv('K_SERVICE'),  # Cloud Run
        os.getenv('K_REVISION'),  # Cloud Run
        os.getenv('FUNCTION_TARGET'),  # Cloud Functions
        os.getenv('GAE_ENV'),  # App Engine
        os.getenv('GCE_METADATA_HOST'),  # General GCE metadata indicator
    ])
    
    if is_gcp_managed:
        logger.debug(
            "Running in GCP managed environment (Cloud Run/GCE/etc.). "
            "Skipping local credentials file search; will use service account from metadata service."
        )
        # If GOOGLE_APPLICATION_CREDENTIALS is explicitly set in this environment,
        # still respect it (for testing/override scenarios)
        val = os.getenv(env_key)
        if val:
            if os.path.exists(val):
                logger.info("Using explicit GOOGLE_APPLICATION_CREDENTIALS from environment: %s", val)
            else:
                logger.warning("GOOGLE_APPLICATION_CREDENTIALS is set but file not found: %s", val)
        return

    # First, prefer values defined in a repo-level .env file (local development).
    # This explicit override is requested by the user and helps ensure the
    # project uses the repo-provided credentials even if another value is
    # present in the parent process environment.
    repo_env_paths = [
        Path(__file__).resolve().parent / '.env.development',
        Path(__file__).resolve().parent / '.env',
        Path(__file__).resolve().parent.parent / '.env.development',
        Path(__file__).resolve().parent.parent / '.env',
    ]

    repo_value = None
    for p in repo_env_paths:
        try:
            if p.exists():
                with open(p, 'r') as fh:
                    for raw in fh:
                        ln = raw.strip()
                        if not ln or ln.startswith('#') or '=' not in ln:
                            continue
                        k, v = ln.split('=', 1)
                        if k.strip() == env_key:
                            repo_value = v.strip().strip('"').strip("'")
                            break
                if repo_value:
                    logger.info("Overriding %s with value from %s", env_key, str(p))
                    os.environ[env_key] = repo_value
                    break
        except Exception:
            continue

    # At this point the env var may have been set/overridden from a repo file.
    val = os.getenv(env_key)

    # If env is set and the file exists, we will use it.
    if val and os.path.exists(val):
        logger.debug("Using GOOGLE_APPLICATION_CREDENTIALS from environment: %s", val)
        found = val
    else:
        if val and not os.path.exists(val):
            logger.warning("GOOGLE_APPLICATION_CREDENTIALS is set but file not found: %s", val)

        # Candidate locations to search for a repository-provided credentials file.
        # Check common locations in order of preference.
        base_dir = Path(__file__).resolve().parent.parent.parent  # -> project/app
        candidates = [
            # app/firestore-access.json (common local dev credentials)
            base_dir / "firestore-access.json",
            # repo root firestore-access.json
            base_dir.parent / "firestore-access.json",
            # infra/firebase or similar locations
            base_dir / "infra" / "firebase" / "firestore-access.json",
            base_dir / "app" / "firestore-access.json",
        ]

        # Legacy/compatibility: try to resolve repository root more defensively
        # rather than indexing into parents which can raise IndexError in some
        # packaging/runtime layouts (e.g. when code is installed into a flat
        # package directory). Build a small helper to safely access ancestors.
        def _ancestor(index: int):
            p = Path(__file__).resolve()
            parents = p.parents
            return parents[index] if index < len(parents) else None

        anc = _ancestor(3)
        if anc:
            candidates.append(anc / "firestore-access.json")

        # As a last resort, try the top-most parent (repository root when
        # running from source) if available.
        try:
            topmost = Path(__file__).resolve().parents[-1]
            if topmost is not None:
                candidates.append(topmost / "firestore-access.json")
        except Exception:
            # If anything goes wrong here, we've already protected against
            # the previously observed IndexError and will simply not add the
            # candidate.
            pass

        found = None
        for cand in candidates:
            try:
                cand_path = str(cand)
            except Exception:
                continue
            if os.path.exists(cand_path):
                found = os.path.normpath(cand_path)
                os.environ[env_key] = found
                logger.info("Set %s to repository credentials file: %s", env_key, found)
                break

    if not found:
        logger.debug("No repository credentials file found in candidate locations")

    # If we have a credentials file, try to parse it and compare project ids
    if found:
        try:
            with open(found, 'r') as fh:
                data = json.load(fh)
            creds_project = data.get('project_id') or data.get('project')
            if creds_project:
                logger.debug("Credentials file project_id=%s", creds_project)
                configured = os.getenv('APP_GOOGLE_PROJECT_ID') or getattr(settings, 'GOOGLE_PROJECT_ID', None) or os.getenv('GOOGLE_PROJECT_ID')
                if configured and creds_project != configured:
                    logger.warning(
                        "Credentials project_id '%s' does not match configured project id '%s'. "
                        "This can cause PermissionDenied errors when accessing Firestore. "
                        "Set APP_GOOGLE_PROJECT_ID to the intended project or use a matching credentials file.",
                        creds_project,
                        configured,
                    )
        except Exception:
            logger.debug("Unable to parse credentials JSON at %s", found)


def get_firestore_client() -> firestore.Client:
    """
    Return a cached Firestore client configured for the current environment.

    - Reuses the same client instance to avoid connection churn.
    - Honours emulator configuration via settings or env vars.
    """
    global _client
    if _client is not None:
        logger.debug("Reusing cached Firestore client for project: %s", getattr(_client, 'project', None))
        return _client

    _ensure_emulator_environment()
    _ensure_credentials_fallback()
    project_id = _resolve_project_id()
    database_id = _resolve_database_id()
    logger.info("Creating Firestore client for project: %s database: %s", project_id, database_id)
    # Pass database id to client when supported
    try:
        _client = firestore.Client(project=project_id, database=database_id)
    except TypeError:
        # Older google-cloud-firestore versions may not accept `database` param
        logger.debug("firestore.Client does not accept 'database' parameter, creating client without database argument")
        _client = firestore.Client(project=project_id)
    logger.debug("Firestore client created: %s", getattr(_client, '__class__', str(_client)))
    return _client


def reset_firestore_client():
    """Reset the cached Firestore client. Useful for tests."""
    global _client
    logger.info("Resetting cached Firestore client")
    _client = None


def get_collection_name(key: str, default: str) -> str:
    """
    Resolve a Firestore collection name from database configuration.
    Falls back to the provided default when no override is present.
    """
    db_config = getattr(settings, "_database_config", None)
    if not db_config or not getattr(db_config, "firestore", None):
        return default
    return db_config.firestore.collections.get(key, default)


# Backwards compatibility export (legacy code expected `client()`)
def client() -> firestore.Client:
    return get_firestore_client()
