from app.core.security import decrypt_pii, encrypt_pii


def test_pii_encryption_and_decryption():
    original_name = "Jane Doe"
    encrypted = encrypt_pii(original_name)
    assert encrypted is not None
    assert encrypted != original_name

    decrypted = decrypt_pii(encrypted)
    assert decrypted == original_name


def test_pii_encryption_none():
    assert encrypt_pii(None) is None
    assert decrypt_pii(None) is None
