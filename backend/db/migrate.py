import asyncio
import logging
import os
from pathlib import Path
import asyncpg
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("fitness_garage.migrate")


async def run_migrations() -> None:
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.error("DATABASE_URL environment variable is not set.")
        return

    logger.info(f"Connecting to database to execute migrations...")
    try:
        conn = await asyncpg.connect(db_url)
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return

    try:
        # Create _migrations tracking table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS _migrations (
                filename TEXT PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        """)

        # Fetch already applied migrations
        rows = await conn.fetch("SELECT filename FROM _migrations")
        applied = {r["filename"] for r in rows}

        # Discover migration files
        migrations_dir = Path(__file__).parent / "migrations"
        if not migrations_dir.exists():
            logger.warning(f"Migrations directory not found: {migrations_dir}")
            return

        migration_files = sorted(migrations_dir.glob("*.sql"))

        for f in migration_files:
            if f.name not in applied:
                logger.info(f"Applying migration: {f.name}...")
                sql = f.read_text(encoding="utf-8")
                async with conn.transaction():
                    await conn.execute(sql)
                    await conn.execute(
                        "INSERT INTO _migrations (filename) VALUES ($1)",
                        f.name,
                    )
                logger.info(f"Successfully applied: {f.name}")
            else:
                logger.debug(f"Migration already applied: {f.name}")

        logger.info("All database migrations are up to date.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(run_migrations())
