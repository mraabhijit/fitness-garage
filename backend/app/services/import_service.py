import io
import logging
from datetime import date, datetime
from typing import Any, Dict, List, Optional

import asyncpg
import pandas as pd

from app.schemas.member import MemberCreate
from app.services.member_service import create_new_member
from db.queries import plan_queries

logger = logging.getLogger("fitness_garage.import")


def parse_date(val: Any) -> date:
    if isinstance(val, (datetime, pd.Timestamp)):
        return val.date()
    elif isinstance(val, date):
        return val
    elif isinstance(val, str):
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y"):
            try:
                return datetime.strptime(val.strip(), fmt).date()
            except ValueError:
                continue
    return date.today()


async def import_members_from_file(
    pool: asyncpg.Pool,
    file_bytes: bytes,
    filename: str,
) -> Dict[str, Any]:
    """
    Parses CSV or Excel file and bulk imports members with encrypted PII.
    Expected columns: full_name (required), phone_number, email_address,
                      tier, duration, start_date, expiry_date, notes
    """
    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(file_bytes))
    elif filename.endswith((".xlsx", ".xls")):
        df = pd.read_excel(io.BytesIO(file_bytes))
    else:
        raise ValueError("Unsupported file format. Please upload .csv or .xlsx file.")

    # Normalize column names
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]

    if "full_name" not in df.columns and "name" in df.columns:
        df["full_name"] = df["name"]

    if "full_name" not in df.columns:
        raise ValueError("Missing required column: 'full_name' or 'name'")

    plans = await plan_queries.get_all_plans(pool)
    plan_map = {(p["tier"].lower(), p["duration"].lower()): p["id"] for p in plans}

    success_count = 0
    errors: List[Dict[str, Any]] = []

    for idx, row in df.iterrows():
        try:
            full_name = str(row.get("full_name", "")).strip()
            if not full_name or full_name.lower() == "nan":
                continue

            raw_phone = str(row.get("phone_number") or row.get("phone") or "").strip()
            phone: Optional[str] = (
                None if not raw_phone or raw_phone.lower() == "nan" else raw_phone
            )

            raw_email = str(row.get("email_address") or row.get("email") or "").strip()
            email: Optional[str] = (
                None if not raw_email or raw_email.lower() == "nan" else raw_email
            )

            start_d = parse_date(row.get("start_date"))
            expiry_d = parse_date(row.get("expiry_date"))

            tier = str(row.get("tier", "basic")).strip().lower()
            duration = str(row.get("duration", "monthly")).strip().lower()
            plan_id = plan_map.get((tier, duration))

            status = "active"
            if expiry_d < date.today():
                status = "expired"

            raw_notes = str(row.get("notes", "")).strip()
            notes: Optional[str] = (
                None if not raw_notes or raw_notes.lower() == "nan" else raw_notes
            )

            member_in = MemberCreate(
                full_name=full_name,
                phone_number=phone,
                email_address=email,
                membership_plan_id=plan_id,
                status=status,
                start_date=start_d,
                expiry_date=expiry_d,
                imported=True,
                notes=notes,
            )

            await create_new_member(pool, member_in)
            success_count += 1

        except Exception as e:
            logger.warning(f"Error importing row {idx + 1}: {e}")
            errors.append({"row": idx + 1, "error": str(e)})

    return {
        "imported_count": success_count,
        "failed_count": len(errors),
        "errors": errors,
    }
