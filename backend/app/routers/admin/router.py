from datetime import date
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID
import asyncpg
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from app.core.auth import AuthenticatedUser, require_admin_or_dev
from app.schemas.achievement import AchievementCreate, AchievementResponse, AchievementUpdate
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.gallery import GalleryCreate, GalleryResponse, GalleryUpdate
from app.schemas.member import MemberCreate, MemberResponse, MemberUpdate
from app.schemas.payment import InvoiceUrlResponse, PaymentCreate, PaymentResponse
from app.schemas.plan import MembershipPlanResponse, MembershipPlanUpdate
from app.schemas.review import ReviewResponse, ReviewUpdate
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate
from app.schemas.site_config import SiteConfigBulkUpdate, SiteConfigResponse
from app.schemas.trainer import TrainerCreate, TrainerResponse, TrainerUpdate
from app.services import import_service, member_service, payment_service, reviews_service
from app.services.storage_service import get_invoice_signed_url, get_public_asset_url
from db.connection import get_pool
from db.queries import (
    achievement_queries,
    gallery_queries,
    member_queries,
    payment_queries,
    plan_queries,
    review_queries,
    service_queries,
    site_config_queries,
    trainer_queries,
)

router = APIRouter(prefix="/admin", tags=["Admin Portal"], dependencies=[Depends(require_admin_or_dev)])


# --- MEMBERS ---
@router.get("/members", response_model=PaginatedResponse[MemberResponse])
async def get_admin_members(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    pool: asyncpg.Pool = Depends(get_pool),
):
    members, total = await member_service.list_members(
        pool=pool, page=page, page_size=page_size, search=search, status_filter=status_filter
    )
    return PaginatedResponse(data=members, total=total, page=page, page_size=page_size)


@router.get("/members/{member_id}", response_model=SuccessResponse[MemberResponse])
async def get_admin_member_detail(member_id: UUID, pool: asyncpg.Pool = Depends(get_pool)):
    member = await member_service.get_member(pool, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return SuccessResponse(data=member)


@router.post("/members", response_model=SuccessResponse[MemberResponse])
async def create_admin_member(data: MemberCreate, pool: asyncpg.Pool = Depends(get_pool)):
    new_member = await member_service.create_new_member(pool, data)
    return SuccessResponse(data=new_member, message="Member created successfully")


@router.put("/members/{member_id}", response_model=SuccessResponse[MemberResponse])
async def update_admin_member(
    member_id: UUID, data: MemberUpdate, pool: asyncpg.Pool = Depends(get_pool)
):
    updated = await member_service.update_existing_member(pool, member_id, data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return SuccessResponse(data=updated, message="Member updated successfully")


@router.delete("/members/{member_id}", response_model=SuccessResponse[Dict[str, Any]])
async def delete_admin_member(member_id: UUID, pool: asyncpg.Pool = Depends(get_pool)):
    rec = await member_queries.soft_delete_member(pool, member_id)
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return SuccessResponse(data={"id": member_id, "status": "suspended"}, message="Member suspended")


@router.post("/members/import", response_model=SuccessResponse[Dict[str, Any]])
async def import_admin_members(
    file: UploadFile = File(...),
    pool: asyncpg.Pool = Depends(get_pool),
):
    file_bytes = await file.read()
    res = await import_service.import_members_from_file(pool, file_bytes, file.filename or "import.csv")
    return SuccessResponse(data=res, message=f"Import completed: {res['imported_count']} succeeded")


# --- PAYMENTS ---
@router.get("/payments", response_model=PaginatedResponse[PaymentResponse])
async def get_admin_payments(
    member_id: Optional[UUID] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    page: int = 1,
    page_size: int = 20,
    pool: asyncpg.Pool = Depends(get_pool),
):
    payments, total = await payment_service.list_payments(
        pool=pool, member_id=member_id, start_date=start_date, end_date=end_date, page=page, page_size=page_size
    )
    return PaginatedResponse(data=payments, total=total, page=page, page_size=page_size)


@router.post("/payments", response_model=SuccessResponse[PaymentResponse])
async def create_admin_payment(
    data: PaymentCreate,
    current_user: AuthenticatedUser = Depends(require_admin_or_dev),
    pool: asyncpg.Pool = Depends(get_pool),
):
    payment = await payment_service.record_payment(pool, data, admin_user_id=current_user.id)
    return SuccessResponse(data=payment, message="Payment recorded and invoice generated")


@router.get("/payments/{payment_id}/invoice", response_model=SuccessResponse[InvoiceUrlResponse])
async def get_admin_invoice_url(payment_id: UUID, pool: asyncpg.Pool = Depends(get_pool)):
    rec = await payment_queries.get_payment_by_id(pool, payment_id)
    if not rec or not rec.get("invoice_path"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    signed_url = await get_invoice_signed_url(rec["invoice_path"], expires_in=3600)
    return SuccessResponse(data=InvoiceUrlResponse(payment_id=payment_id, download_url=signed_url))


# --- PLANS ---
@router.get("/plans", response_model=SuccessResponse[List[MembershipPlanResponse]])
async def get_admin_plans(pool: asyncpg.Pool = Depends(get_pool)):
    records = await plan_queries.get_all_plans(pool, active_only=False)
    return SuccessResponse(data=[MembershipPlanResponse.model_validate(dict(r)) for r in records])


@router.put("/plans/{plan_id}", response_model=SuccessResponse[MembershipPlanResponse])
async def update_admin_plan(
    plan_id: UUID, data: MembershipPlanUpdate, pool: asyncpg.Pool = Depends(get_pool)
):
    rec = await plan_queries.update_plan(
        pool=pool,
        plan_id=plan_id,
        price=data.price,
        description=data.description,
        is_active=data.is_active,
    )
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return SuccessResponse(data=MembershipPlanResponse.model_validate(dict(rec)), message="Plan updated")


# --- SERVICES ---
@router.get("/services", response_model=SuccessResponse[List[ServiceResponse]])
async def get_admin_services(pool: asyncpg.Pool = Depends(get_pool)):
    records = await service_queries.get_all_services(pool, active_only=False)
    return SuccessResponse(data=[ServiceResponse.model_validate(dict(r)) for r in records])


@router.post("/services", response_model=SuccessResponse[ServiceResponse])
async def create_admin_service(data: ServiceCreate, pool: asyncpg.Pool = Depends(get_pool)):
    rec = await service_queries.create_service(
        pool=pool,
        name=data.name,
        slug=data.slug,
        description=data.description,
        icon_filename=data.icon_filename,
        display_order=data.display_order,
        is_active=data.is_active,
    )
    return SuccessResponse(data=ServiceResponse.model_validate(dict(rec)), message="Service created")


@router.put("/services/{service_id}", response_model=SuccessResponse[ServiceResponse])
async def update_admin_service(
    service_id: UUID, data: ServiceUpdate, pool: asyncpg.Pool = Depends(get_pool)
):
    rec = await service_queries.update_service(
        pool=pool,
        service_id=service_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        icon_filename=data.icon_filename,
        display_order=data.display_order,
        is_active=data.is_active,
    )
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return SuccessResponse(data=ServiceResponse.model_validate(dict(rec)), message="Service updated")


@router.delete("/services/{service_id}", response_model=SuccessResponse[Dict[str, Any]])
async def delete_admin_service(service_id: UUID, pool: asyncpg.Pool = Depends(get_pool)):
    rec = await service_queries.soft_delete_service(pool, service_id)
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return SuccessResponse(data={"id": service_id, "is_active": False}, message="Service deactivated")


# --- TRAINERS ---
@router.get("/trainers", response_model=SuccessResponse[List[TrainerResponse]])
async def get_admin_trainers(pool: asyncpg.Pool = Depends(get_pool)):
    records = await trainer_queries.get_all_trainers(pool, active_only=False)
    return SuccessResponse(data=[TrainerResponse.model_validate(dict(r)) for r in records])


@router.post("/trainers", response_model=SuccessResponse[TrainerResponse])
async def create_admin_trainer(data: TrainerCreate, pool: asyncpg.Pool = Depends(get_pool)):
    rec = await trainer_queries.create_trainer(
        pool=pool,
        name=data.name,
        slug=data.slug,
        specialization=data.specialization,
        experience_years=data.experience_years,
        certifications=data.certifications,
        bio=data.bio,
        photo_filename=data.photo_filename,
        display_order=data.display_order,
        is_active=data.is_active,
    )
    return SuccessResponse(data=TrainerResponse.model_validate(dict(rec)), message="Trainer created")


@router.put("/trainers/{trainer_id}", response_model=SuccessResponse[TrainerResponse])
async def update_admin_trainer(
    trainer_id: UUID, data: TrainerUpdate, pool: asyncpg.Pool = Depends(get_pool)
):
    rec = await trainer_queries.update_trainer(
        pool=pool,
        trainer_id=trainer_id,
        name=data.name,
        slug=data.slug,
        specialization=data.specialization,
        experience_years=data.experience_years,
        certifications=data.certifications,
        bio=data.bio,
        photo_filename=data.photo_filename,
        display_order=data.display_order,
        is_active=data.is_active,
    )
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainer not found")
    return SuccessResponse(data=TrainerResponse.model_validate(dict(rec)), message="Trainer updated")


@router.delete("/trainers/{trainer_id}", response_model=SuccessResponse[Dict[str, Any]])
async def delete_admin_trainer(trainer_id: UUID, pool: asyncpg.Pool = Depends(get_pool)):
    rec = await trainer_queries.soft_delete_trainer(pool, trainer_id)
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainer not found")
    return SuccessResponse(data={"id": trainer_id, "is_active": False}, message="Trainer deactivated")


# --- GALLERY ---
@router.get("/gallery", response_model=SuccessResponse[List[GalleryResponse]])
async def get_admin_gallery(folder: Optional[str] = None, pool: asyncpg.Pool = Depends(get_pool)):
    records = await gallery_queries.get_gallery_items(pool, folder_path=folder, active_only=False)
    results = []
    for r in records:
        d = dict(r)
        d["url"] = get_public_asset_url(f"{d['folder_path']}/{d['file_name']}")
        results.append(GalleryResponse.model_validate(d))
    return SuccessResponse(data=results)


@router.post("/gallery", response_model=SuccessResponse[GalleryResponse])
async def create_admin_gallery_item(
    data: GalleryCreate,
    current_user: AuthenticatedUser = Depends(require_admin_or_dev),
    pool: asyncpg.Pool = Depends(get_pool),
):
    rec = await gallery_queries.create_gallery_item(
        pool=pool,
        folder_path=data.folder_path,
        file_name=data.file_name,
        media_type=data.media_type,
        caption=data.caption,
        display_order=data.display_order,
        is_active=data.is_active,
        uploaded_by=current_user.id,
    )
    d = dict(rec)
    d["url"] = get_public_asset_url(f"{d['folder_path']}/{d['file_name']}")
    return SuccessResponse(data=GalleryResponse.model_validate(d), message="Asset registered")


@router.put("/gallery/{gallery_id}", response_model=SuccessResponse[GalleryResponse])
async def update_admin_gallery_item(
    gallery_id: UUID, data: GalleryUpdate, pool: asyncpg.Pool = Depends(get_pool)
):
    rec = await gallery_queries.update_gallery_item(
        pool=pool,
        gallery_id=gallery_id,
        caption=data.caption,
        display_order=data.display_order,
        is_active=data.is_active,
    )
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found")
    d = dict(rec)
    d["url"] = get_public_asset_url(f"{d['folder_path']}/{d['file_name']}")
    return SuccessResponse(data=GalleryResponse.model_validate(d), message="Gallery item updated")


@router.delete("/gallery/{gallery_id}", response_model=SuccessResponse[Dict[str, Any]])
async def delete_admin_gallery_item(gallery_id: UUID, pool: asyncpg.Pool = Depends(get_pool)):
    rec = await gallery_queries.delete_gallery_item(pool, gallery_id)
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found")
    return SuccessResponse(data={"id": gallery_id}, message="Gallery item deleted")


# --- SITE CONFIG ---
@router.get("/site-config", response_model=SuccessResponse[List[SiteConfigResponse]])
async def get_admin_site_configs(pool: asyncpg.Pool = Depends(get_pool)):
    records = await site_config_queries.get_all_site_configs(pool)
    return SuccessResponse(data=[SiteConfigResponse.model_validate(dict(r)) for r in records])


@router.put("/site-config", response_model=SuccessResponse[List[SiteConfigResponse]])
async def update_admin_site_configs(data: SiteConfigBulkUpdate, pool: asyncpg.Pool = Depends(get_pool)):
    records = await site_config_queries.bulk_update_site_configs(pool, data.configs)
    return SuccessResponse(
        data=[SiteConfigResponse.model_validate(dict(r)) for r in records],
        message="Site configuration updated successfully",
    )


# --- ACHIEVEMENTS ---
@router.get("/achievements", response_model=SuccessResponse[List[AchievementResponse]])
async def get_admin_achievements(pool: asyncpg.Pool = Depends(get_pool)):
    records = await achievement_queries.get_all_achievements(pool, active_only=False)
    return SuccessResponse(data=[AchievementResponse.model_validate(dict(r)) for r in records])


@router.post("/achievements", response_model=SuccessResponse[AchievementResponse])
async def create_admin_achievement(data: AchievementCreate, pool: asyncpg.Pool = Depends(get_pool)):
    rec = await achievement_queries.create_achievement(
        pool=pool,
        label=data.label,
        value=data.value,
        display_order=data.display_order,
        is_active=data.is_active,
    )
    return SuccessResponse(data=AchievementResponse.model_validate(dict(rec)), message="Achievement created")


@router.put("/achievements/{achievement_id}", response_model=SuccessResponse[AchievementResponse])
async def update_admin_achievement(
    achievement_id: UUID, data: AchievementUpdate, pool: asyncpg.Pool = Depends(get_pool)
):
    rec = await achievement_queries.update_achievement(
        pool=pool,
        achievement_id=achievement_id,
        label=data.label,
        value=data.value,
        display_order=data.display_order,
        is_active=data.is_active,
    )
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
    return SuccessResponse(data=AchievementResponse.model_validate(dict(rec)), message="Achievement updated")


@router.delete("/achievements/{achievement_id}", response_model=SuccessResponse[Dict[str, Any]])
async def delete_admin_achievement(achievement_id: UUID, pool: asyncpg.Pool = Depends(get_pool)):
    rec = await achievement_queries.soft_delete_achievement(pool, achievement_id)
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
    return SuccessResponse(data={"id": achievement_id, "is_active": False}, message="Achievement deactivated")


# --- REVIEWS ---
@router.get("/reviews", response_model=SuccessResponse[List[ReviewResponse]])
async def get_admin_reviews(pool: asyncpg.Pool = Depends(get_pool)):
    records = await review_queries.get_all_reviews(pool, visible_only=False)
    return SuccessResponse(data=[ReviewResponse.model_validate(dict(r)) for r in records])


@router.put("/reviews/{review_id}", response_model=SuccessResponse[ReviewResponse])
async def toggle_admin_review_visibility(
    review_id: UUID, data: ReviewUpdate, pool: asyncpg.Pool = Depends(get_pool)
):
    rec = await review_queries.update_review_visibility(pool, review_id, data.is_visible)
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return SuccessResponse(data=ReviewResponse.model_validate(dict(rec)), message="Review visibility updated")


@router.post("/reviews/sync", response_model=SuccessResponse[Dict[str, Any]])
async def trigger_admin_reviews_sync(pool: asyncpg.Pool = Depends(get_pool)):
    res = await reviews_service.sync_google_reviews(pool, force=True)
    return SuccessResponse(data=res, message="Reviews sync completed")
