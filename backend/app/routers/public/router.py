from typing import Dict, List

import asyncpg
from fastapi import APIRouter, Depends

from app.schemas.achievement import AchievementResponse
from app.schemas.common import SuccessResponse
from app.schemas.gallery import GalleryResponse
from app.schemas.plan import MembershipPlanResponse
from app.schemas.review import ReviewResponse
from app.schemas.service import ServiceResponse
from app.schemas.trainer import TrainerResponse
from app.services.storage_service import get_public_asset_url
from db.connection import get_pool
from db.queries import (
    achievement_queries,
    gallery_queries,
    plan_queries,
    review_queries,
    service_queries,
    site_config_queries,
    trainer_queries,
)

router = APIRouter(prefix="/public", tags=["Public"])


@router.get("/site-config", response_model=SuccessResponse[Dict[str, str]])
async def get_site_config(pool: asyncpg.Pool = Depends(get_pool)):
    records = await site_config_queries.get_all_site_configs(pool)
    config_dict = {r["config_key"]: r["config_value"] for r in records}
    return SuccessResponse(data=config_dict)


@router.get("/achievements", response_model=SuccessResponse[List[AchievementResponse]])
async def get_achievements(pool: asyncpg.Pool = Depends(get_pool)):
    records = await achievement_queries.get_all_achievements(pool, active_only=True)
    return SuccessResponse(data=[AchievementResponse.model_validate(dict(r)) for r in records])


@router.get("/services", response_model=SuccessResponse[List[ServiceResponse]])
async def get_services(pool: asyncpg.Pool = Depends(get_pool)):
    records = await service_queries.get_all_services(pool, active_only=True)
    results = []
    for r in records:
        d = dict(r)
        d["icon_url"] = (
            get_public_asset_url(f"assets/services/{d['icon_filename']}")
            if d.get("icon_filename")
            else None
        )
        results.append(ServiceResponse.model_validate(d))
    return SuccessResponse(data=results)


@router.get("/plans", response_model=SuccessResponse[List[MembershipPlanResponse]])
async def get_plans(pool: asyncpg.Pool = Depends(get_pool)):
    records = await plan_queries.get_all_plans(pool, active_only=True)
    return SuccessResponse(data=[MembershipPlanResponse.model_validate(dict(r)) for r in records])


@router.get("/trainers", response_model=SuccessResponse[List[TrainerResponse]])
async def get_trainers(pool: asyncpg.Pool = Depends(get_pool)):
    records = await trainer_queries.get_all_trainers(pool, active_only=True)
    results = []
    for r in records:
        d = dict(r)
        d["photo_url"] = (
            get_public_asset_url(f"assets/trainers/{d['photo_filename']}")
            if d.get("photo_filename")
            else None
        )
        results.append(TrainerResponse.model_validate(d))
    return SuccessResponse(data=results)


@router.get("/gallery", response_model=SuccessResponse[List[GalleryResponse]])
async def get_gallery(folder: str | None = None, pool: asyncpg.Pool = Depends(get_pool)):
    records = await gallery_queries.get_gallery_items(pool, folder_path=folder, active_only=True)
    results = []
    for r in records:
        d = dict(r)
        d["url"] = get_public_asset_url(f"{d['folder_path']}/{d['file_name']}")
        results.append(GalleryResponse.model_validate(d))
    return SuccessResponse(data=results)


@router.get("/reviews", response_model=SuccessResponse[List[ReviewResponse]])
async def get_reviews(pool: asyncpg.Pool = Depends(get_pool)):
    records = await review_queries.get_all_reviews(pool, visible_only=True)
    return SuccessResponse(data=[ReviewResponse.model_validate(dict(r)) for r in records])
