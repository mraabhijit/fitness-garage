from datetime import date
from typing import List, Optional
from uuid import UUID
import asyncpg


async def get_all_reviews(pool: asyncpg.Pool, visible_only: bool = False) -> List[asyncpg.Record]:
    if visible_only:
        return await pool.fetch(
            """
            SELECT id, google_review_id, reviewer_name, review_text, rating,
                   review_date, last_synced_at, is_visible, created_at, updated_at
            FROM reviews
            WHERE is_visible = TRUE
            ORDER BY rating DESC, review_date DESC
            """
        )
    return await pool.fetch(
        """
        SELECT id, google_review_id, reviewer_name, review_text, rating,
               review_date, last_synced_at, is_visible, created_at, updated_at
        FROM reviews
        ORDER BY review_date DESC
        """
    )


async def get_review_by_id(pool: asyncpg.Pool, review_id: UUID) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        SELECT id, google_review_id, reviewer_name, review_text, rating,
               review_date, last_synced_at, is_visible, created_at, updated_at
        FROM reviews
        WHERE id = $1
        """,
        review_id,
    )


async def upsert_google_review(
    pool: asyncpg.Pool,
    google_review_id: str,
    reviewer_name: str,
    review_text: Optional[str],
    rating: int,
    review_date: date,
) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        INSERT INTO reviews (
            google_review_id, reviewer_name, review_text, rating,
            review_date, last_synced_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (google_review_id) DO UPDATE
        SET reviewer_name = EXCLUDED.reviewer_name,
            review_text = EXCLUDED.review_text,
            rating = EXCLUDED.rating,
            review_date = EXCLUDED.review_date,
            last_synced_at = NOW()
        RETURNING id, google_review_id, reviewer_name, review_text, rating,
                  review_date, last_synced_at, is_visible, created_at, updated_at
        """,
        google_review_id,
        reviewer_name,
        review_text,
        rating,
        review_date,
    )


async def update_review_visibility(
    pool: asyncpg.Pool,
    review_id: UUID,
    is_visible: bool,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        UPDATE reviews
        SET is_visible = $2
        WHERE id = $1
        RETURNING id, google_review_id, reviewer_name, review_text, rating,
                  review_date, last_synced_at, is_visible, created_at, updated_at
        """,
        review_id,
        is_visible,
    )
