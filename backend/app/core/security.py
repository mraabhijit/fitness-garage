import logging
from cryptography.fernet import Fernet, InvalidToken
from app.core.config import settings

logger = logging.getLogger("fitness_garage.security")

_fernet: Fernet | None = None


def get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        key = settings.AES_ENCRYPTION_KEY
        if isinstance(key, str):
            key_bytes = key.encode("utf-8")
        else:
            key_bytes = key
        try:
            _fernet = Fernet(key_bytes)
        except Exception as e:
            logger.error(f"Failed to initialize Fernet with provided key: {e}")
            raise ValueError("Invalid AES_ENCRYPTION_KEY. Key must be a 32-byte url-safe base64 string.") from e
    return _fernet


def encrypt_pii(data: str | None) -> str | None:
    """
    Encrypts a string field using Fernet AES-256.
    Returns ciphertext as a utf-8 string, or None if input is None/empty.
    """
    if not data:
        return None
    fernet = get_fernet()
    encrypted_bytes = fernet.encrypt(data.encode("utf-8"))
    return encrypted_bytes.decode("utf-8")


def decrypt_pii(encrypted_data: str | None) -> str | None:
    """
    Decrypts a Fernet AES-256 ciphertext string.
    Returns decrypted plaintext string, or original value if decryption fails or input is None/empty.
    """
    if not encrypted_data:
        return None
    fernet = get_fernet()
    try:
        decrypted_bytes = fernet.decrypt(encrypted_data.encode("utf-8"))
        return decrypted_bytes.decode("utf-8")
    except (InvalidToken, Exception) as e:
        logger.warning(f"Decryption failed or data is not ciphertext: {e}")
        return encrypted_data
