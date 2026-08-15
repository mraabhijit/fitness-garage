from typing import List, Optional
from uuid import UUID
import asyncpg


async def get_all_trainers(pool: asyncpg.Pool, active_only: bool = False) -> List[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT id, name, slug, specialization, experience_years,
               certifications, bio, photo_filename, display_order, is_active,
               created_at, updated_at
        FROM trainers
        WHERE (NOT $1::bool OR is_active = TRUE)
        ORDER BY display_order ASC, name ASC
        """,
        active_only,
    )


async def get_trainer_by_id(pool: asyncpg.Pool, trainer_id: UUID) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        SELECT id, name, slug, specialization, experience_years,
               certifications, bio, photo_filename, display_order, is_active,
               created_at, updated_at
        FROM trainers
        WHERE id = $1
        """,
        trainer_id,
    )


async def get_trainer_by_slug(pool: asyncpg.Pool, slug: str) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        SELECT id, name, slug, specialization, experience_years,
               certifications, bio, photo_filename, display_order, is_active,
               created_at, updated_at
        FROM trainers
        WHERE slug = $1
        """,
        slug,
    )


async def create_trainer(
    pool: asyncpg.Pool,
    name: str,
    slug: str,
    specialization: str,
    experience_years: int = 0,
    certifications: Optional[List[str]] = None,
    bio: Optional[str] = None,
    photo_filename: Optional[str] = None,
    display_order: int = 0,
    is_active: bool = True,
) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        INSERT INTO trainers (
            name, slug, specialization, experience_years,
            certifications, bio, photo_filename, display_order, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, name, slug, specialization, experience_years,
                  certifications, bio, photo_filename, display_order, is_active,
                  created_at, updated_at
        """,
        name,
        slug,
        specialization,
        experience_years,
        certifications or [],
        bio,
        photo_filename,
        display_order,
        is_active,
    )


async def update_trainer(
    pool: asyncpg.Pool,
    trainer_id: UUID,
    name: Optional[str] = None,
    slug: Optional[str] = None,
    specialization: Optional[str] = None,
    experience_years: Optional[int] = None,
    certifications: Optional[List[str]] = None,
    bio: Optional[str] = None,
    photo_filename: Optional[str] = None,
    display_order: Optional[int] = None,
    is_active: Optional[bool] = None,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        UPDATE trainers
        SET name = COALESCE($2, name),
            slug = COALESCE($3, slug),
            specialization = COALESCE($4, specialization),
            experience_years = COALESCE($5, experience_years),
            certifications = COALESCE($6, certifications),
            bio = COALESCE($7, bio),
            photo_filename = COALESCE($8, photo_filename),
            display_order = COALESCE($9, display_order),
            is_active = COALESCE($10, is_active)
        WHERE id = $1
        RETURNING id, name, slug, specialization, experience_years,
                  certifications, bio, photo_filename, display_order, is_active,
                  created_at, updated_at
        """,
        trainer_id,
        name,
        slug,
        specialization,
        experience_years,
        certifications,
        bio,
        photo_filename,
        display_order,
        is_active,
    )


async def soft_delete_trainer(pool: asyncpg.Pool, trainer_id: UUID) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        UPDATE trainers
        SET is_active = FALSE
        WHERE id = $1
        RETURNING id, is_active, updated_at
        """,
        trainer_id,
    )
