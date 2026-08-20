from typing import Dict, List, Optional

import asyncpg


async def get_all_site_configs(pool: asyncpg.Pool) -> List[asyncpg.Record]:
    return await pool.fetch("""
        SELECT id, config_key, config_value, description, updated_at
        FROM site_config
        ORDER BY config_key ASC
        """)


async def get_site_config_by_key(pool: asyncpg.Pool, config_key: str) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        SELECT id, config_key, config_value, description, updated_at
        FROM site_config
        WHERE config_key = $1
        """,
        config_key,
    )


async def upsert_site_config(
    pool: asyncpg.Pool,
    config_key: str,
    config_value: str,
    description: Optional[str] = None,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        INSERT INTO site_config (config_key, config_value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (config_key) DO UPDATE
        SET config_value = EXCLUDED.config_value,
            description = COALESCE(EXCLUDED.description, site_config.description)
        RETURNING id, config_key, config_value, description, updated_at
        """,
        config_key,
        config_value,
        description,
    )


async def bulk_update_site_configs(
    pool: asyncpg.Pool,
    configs: Dict[str, str],
) -> List[asyncpg.Record]:
    updated_records = []
    async with pool.acquire() as conn:
        async with conn.transaction():
            for key, val in configs.items():
                rec = await conn.fetchrow(
                    """
                    INSERT INTO site_config (config_key, config_value)
                    VALUES ($1, $2)
                    ON CONFLICT (config_key) DO UPDATE
                    SET config_value = EXCLUDED.config_value
                    RETURNING id, config_key, config_value, description, updated_at
                    """,
                    key,
                    str(val),
                )
                if rec:
                    updated_records.append(rec)
    return updated_records
