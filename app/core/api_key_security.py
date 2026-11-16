
import hashlib
import secrets


def generate_api_key() -> str:
    """Generate a secure, random API key."""
    return f"ll_live_{secrets.token_urlsafe(32)}"


def hash_api_key(api_key: str) -> str:
    """Create a SHA-256 hash of an API key."""
    return hashlib.sha256(
        api_key.encode("utf-8")
    ).hexdigest()


def get_key_prefix(api_key: str) -> str:
    """Return a short prefix for identifying an API key."""
    return api_key[:16]
