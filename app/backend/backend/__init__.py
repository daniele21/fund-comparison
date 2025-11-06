"""
Compatibility package that exposes the legacy `backend.*` import paths.

Most modules in this codebase live alongside this package (for example
`settings.py`, `routes/`, `services/`). Earlier templates referenced them via
`backend.settings` and similar dotted paths, which would normally require the
project to be installed as a package. Rather than forcing a packaging step for
local development we shim those imports here by re-exporting the modules that
live in the same directory.
"""

from importlib import import_module, util
from pathlib import Path
import sys
from types import ModuleType
from typing import Dict

# Base directory that contains the target modules (app/backend)
_BASE_PATH = Path(__file__).resolve().parent.parent

# Ensure the parent directory (containing settings.py, routes/, etc.) is on
# sys.path so subsequent imports succeed when the project isn't installed as a package.
str_base = str(_BASE_PATH)
if str_base not in sys.path:
    sys.path.insert(0, str_base)

# Also ensure the `backend` package can find modules that live in the parent
# directory (for example `app/backend/providers/*` and `app/backend/settings.py`).
# When this file is executed, __path__ is defined for the package; extend it so
# the import system will search the parent folder as well.
try:
    if str_base not in __path__:
        __path__.insert(0, str_base)
except NameError:
    # If __path__ isn't defined for some reason, skip gracefully.
    pass

# Map of submodules that should be accessible under the `backend.` namespace.
_SUBMODULES = (
    "settings",
    "auth",
    "config",
    "middleware",
    "providers",
    "repositories",
    "routes",
    "schemas",
    "security",
    "services",
    "tests",
)

# Load each target module and register it under the backend.* namespace.
# We use file-based loading via importlib.util so that modules are created with
# the correct fully-qualified name (e.g. `backend.repositories`) and therefore
# their __package__ attribute is set properly. This ensures relative imports
# inside those modules (like `from ..providers import ...`) work as expected.
_exported: Dict[str, ModuleType] = {}
for name in _SUBMODULES:
    fq_name = f"{__name__}.{name}"
    module_path_dir = _BASE_PATH / name
    module_path_file = _BASE_PATH / f"{name}.py"

    # Prefer package directories (with __init__.py) otherwise fall back to a .py file.
    if (module_path_dir / "__init__.py").exists():
        path = str(module_path_dir / "__init__.py")
    elif module_path_file.exists():
        path = str(module_path_file)
    else:
        # Module not present on disk; skip it.
        continue

    try:
        spec = util.spec_from_file_location(fq_name, path)
        if spec is None or spec.loader is None:
            continue
        module = util.module_from_spec(spec)
        # Register early so that recursive imports referencing backend.<name>
        # can find the module while it's being initialized.
        sys.modules[fq_name] = module
        spec.loader.exec_module(module)
    except Exception:
        # If file-based loading fails for any reason, skip the module; it's
        # better to continue than to raise here and break the whole shim.
        if fq_name in sys.modules:
            del sys.modules[fq_name]
        continue

    _exported[name] = module

__all__ = sorted(_exported)
