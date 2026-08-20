import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger("fitness_garage.auth")

security = HTTPBearer(auto_error=False)


class AuthenticatedUser(BaseModel):
    id: UUID
    email: Optional[str] = None
    role: str = "member"  # member, admin, dev
    raw_claims: Dict[str, Any] = {}


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
) -> AuthenticatedUser:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        # Decode without verification if secret is not set (for dev/local), or with secret if set
        if settings.SUPABASE_JWT_SECRET:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        else:
            # Decode token claims
            payload = jwt.decode(
                token,
                options={"verify_signature": False, "verify_aud": False},
            )

        user_id_str = payload.get("sub") or payload.get("id")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload is missing user ID (sub)",
            )

        user_id = UUID(user_id_str)
        role = payload.get("user_metadata", {}).get("role") or payload.get("role") or "member"

        return AuthenticatedUser(
            id=user_id,
            email=payload.get("email"),
            role=str(role).lower(),
            raw_claims=payload,
        )

    except jwt.PyJWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid user ID format in token: {str(e)}",
        )


def require_roles(allowed_roles: List[str]) -> Any:
    async def role_checker(
        current_user: AuthenticatedUser = Depends(get_current_user),
    ) -> AuthenticatedUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: requires one of the following roles: {allowed_roles}",
            )
        return current_user

    return role_checker


# Convenient role dependencies
require_admin_or_dev = require_roles(["admin", "dev"])
require_member = require_roles(["member", "admin", "dev"])
