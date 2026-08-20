import logging

from app.core.config import settings

logger = logging.getLogger("fitness_garage.storage")


def get_public_asset_url(file_path: str) -> str:
    """
    Constructs public asset URL in Supabase Storage.
    e.g. assets/trainers/trainer-one.jpg ->
    https://<project>.supabase.co/storage/v1/object/public/assets/trainers/trainer-one.jpg
    """
    if not file_path or file_path.startswith("http://") or file_path.startswith("https://"):
        return file_path or ""
    clean_path = file_path.lstrip("/")
    base_url = settings.SUPABASE_URL.rstrip("/")
    return f"{base_url}/storage/v1/object/public/{clean_path}"


async def get_invoice_signed_url(invoice_path: str, expires_in: int = 3600) -> str:
    """
    Generates a signed temporary URL for private invoice downloads.
    """
    if not invoice_path:
        return ""
    try:
        from supabase import create_client

        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
            client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            path_in_bucket = (
                invoice_path.replace("invoices/", "", 1)
                if invoice_path.startswith("invoices/")
                else invoice_path
            )
            res = client.storage.from_("invoices").create_signed_url(path_in_bucket, expires_in)
            if isinstance(res, dict) and "signedURL" in res:
                return str(res["signedURL"])
            elif hasattr(res, "signed_url"):
                return str(res.signed_url)
    except Exception as e:
        logger.warning(f"Failed to generate Supabase signed URL: {e}")

    return f"/api/v1/member/payments/invoice/download?path={invoice_path}"
