from typing import Any, List, Optional
from uuid import UUID

import asyncpg


async def get_gallery_items(
    pool: asyncpg.Pool,
    folder_path: Optional[str] = None,
    active_only: bool = False,
) -> List[asyncpg.Record]:
    conditions = []
    params: List[Any] = []

    if folder_path:
        params.append(folder_path)
        conditions.append(f"folder_path = ${len(params)}")

    if active_only:
        conditions.append("is_active = TRUE")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    query = f"""
        SELECT id, folder_path, file_name, media_type, caption,
               display_order, is_active, uploaded_by, created_at, updated_at
        FROM gallery
        {where_clause}
        ORDER BY display_order ASC, created_at DESC
    """
    return await pool.fetch(query, *params)


async def get_gallery_by_id(pool: asyncpg.Pool, gallery_id: UUID) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        SELECT id, folder_path, file_name, media_type, caption,
               display_order, is_active, uploaded_by, created_at, updated_at
        FROM gallery
        WHERE id = $1
        """,
        gallery_id,
    )


async def create_gallery_item(
    pool: asyncpg.Pool,
    folder_path: str,
    file_name: str,
    media_type: str,
    caption: Optional[str] = None,
    display_order: int = 0,
    is_active: bool = True,
    uploaded_by: Optional[UUID] = None,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        INSERT INTO gallery (
            folder_path, file_name, media_type, caption,
            display_order, is_active, uploaded_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, folder_path, file_name, media_type, caption,
                  display_order, is_active, uploaded_by, created_at, updated_at
        """,
        folder_path,
        file_name,
        media_type,
        caption,
        display_order,
        is_active,
        uploaded_by,
    )


async def update_gallery_item(
    pool: asyncpg.Pool,
    gallery_id: UUID,
    caption: Optional[str] = None,
    display_order: Optional[int] = None,
    is_active: Optional[bool] = None,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        UPDATE gallery
        SET caption = COALESCE($2, caption),
            display_order = COALESCE($3, display_order),
            is_active = COALESCE($4, is_active)
        WHERE id = $1
        RETURNING id, folder_path, file_name, media_type, caption,
                  display_order, is_active, uploaded_by, created_at, updated_at
        """,
        gallery_id,
        caption,
        display_order,
        is_active,
    )


async def delete_gallery_item(pool: asyncpg.Pool, gallery_id: UUID) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        DELETE FROM gallery
        WHERE id = $1
        RETURNING id, folder_path, file_name
        """,
        gallery_id,
    )
