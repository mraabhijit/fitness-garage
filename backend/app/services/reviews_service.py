from datetime import datetime, timezone
import logging
from typing import Any, Dict
import asyncpg
import httpx
from app.core.config import settings
from db.queries import review_queries, site_config_queries

logger = logging.getLogger("fitness_garage.reviews")


async def sync_google_reviews(pool: asyncpg.Pool, force: bool = False) -> Dict[str, Any]:
    """
    Syncs reviews from Google Places API if > 24 hours since last sync or if force=True.
    """
    last_synced_rec = await site_config_queries.get_site_config_by_key(pool, "reviews_last_synced_at")
    place_id_rec = await site_config_queries.get_site_config_by_key(pool, "gym_google_place_id")

    place_id = place_id_rec["config_value"] if place_id_rec else ""
    api_key = settings.GOOGLE_PLACES_API_KEY

    if not api_key or not place_id:
        logger.info("Google Places API key or Place ID is not configured. Skipping reviews sync.")
        return {"synced": False, "message": "API key or Place ID not configured"}

    # Check 24-hour threshold
    if not force and last_synced_rec:
        try:
            last_synced_dt = datetime.fromisoformat(last_synced_rec["config_value"].replace("Z", "+00:00"))
            hours_diff = (datetime.now(timezone.utc) - last_synced_dt).total_seconds() / 3600
            if hours_diff < 24:
                return {"synced": False, "message": f"Cache is fresh ({hours_diff:.1f}h ago)"}
        except Exception:
            pass

    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=reviews,rating,user_ratings_total&key={api_key}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            data = resp.json()

        if data.get("status") != "OK":
            logger.warning(f"Google Places API returned status: {data.get('status')}")
            return {"synced": False, "error": data.get("error_message", data.get("status"))}

        reviews = data.get("result", {}).get("reviews", [])
        synced_count = 0

        for r in reviews:
            review_id = f"google_{r.get('author_name')}_{r.get('time')}"
            review_date = datetime.fromtimestamp(r.get("time", 0), tz=timezone.utc).date()

            await review_queries.upsert_google_review(
                pool=pool,
                google_review_id=review_id,
                reviewer_name=r.get("author_name", "Anonymous"),
                review_text=r.get("text", ""),
                rating=int(r.get("rating", 5)),
                review_date=review_date,
            )
            synced_count += 1

        # Update last synced timestamp
        await site_config_queries.upsert_site_config(
            pool=pool,
            config_key="reviews_last_synced_at",
            config_value=datetime.now(timezone.utc).isoformat(),
        )

        return {"synced": True, "synced_count": synced_count}

    except Exception as e:
        logger.error(f"Failed to sync Google Reviews: {e}")
        return {"synced": False, "error": str(e)}
