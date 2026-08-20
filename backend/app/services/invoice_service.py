import io
import logging
from datetime import date
from decimal import Decimal
from uuid import UUID

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.core.config import settings

logger = logging.getLogger("fitness_garage.invoice")


def generate_invoice_pdf(
    payment_id: UUID,
    member_name: str,
    member_email: str | None,
    member_phone: str | None,
    amount: Decimal,
    payment_date: date,
    payment_method: str,
    plan_tier: str | None = None,
    plan_duration: str | None = None,
) -> bytes:
    """
    Generates a PDF invoice using ReportLab and returns the PDF bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )
    story = []
    styles = getSampleStyleSheet()

    # Brand Colors
    garage_black = colors.HexColor("#1A1A1A")
    garage_chrome = colors.HexColor("#D4AF37")
    garage_mid = colors.HexColor("#3D3D3D")
    garage_dark = colors.HexColor("#2C2C2C")

    # Custom typography styles
    title_style = ParagraphStyle(
        "InvoiceTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=garage_chrome,
    )
    subtitle_style = ParagraphStyle(
        "InvoiceSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=garage_mid,
    )
    body_style = ParagraphStyle(
        "InvoiceBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=garage_black,
    )
    bold_style = ParagraphStyle(
        "InvoiceBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=garage_black,
    )

    # Header
    story.append(Paragraph("FITNESS GARAGE", title_style))
    story.append(Paragraph("Push Beyond Your Limits", subtitle_style))
    story.append(Spacer(1, 15))

    tier_part = plan_tier.upper() if plan_tier else "STANDARD"
    duration_part = plan_duration.capitalize() if plan_duration else "MEMBERSHIP"
    plan_str = f"{tier_part} — {duration_part}"
    details_data = [
        [
            Paragraph("<b>INVOICE TO:</b>", bold_style),
            Paragraph("<b>INVOICE DETAILS:</b>", bold_style),
        ],
        [
            Paragraph(
                f"Member: {member_name}<br/>"
                f"Phone: {member_phone or 'N/A'}<br/>"
                f"Email: {member_email or 'N/A'}",
                body_style,
            ),
            Paragraph(
                f"Invoice ID: #{str(payment_id)[:8]}<br/>"
                f"Date: {payment_date.strftime('%d %b %Y')}<br/>"
                f"Method: {payment_method.upper()}",
                body_style,
            ),
        ],
    ]
    details_table = Table(details_data, colWidths=[260, 260])
    details_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    story.append(details_table)
    story.append(Spacer(1, 20))

    # Line Items Table
    items_data = [
        [
            Paragraph(
                "<b>Description</b>",
                ParagraphStyle("Hdr", fontName="Helvetica-Bold", textColor=colors.white),
            ),
            Paragraph(
                "<b>Duration</b>",
                ParagraphStyle("Hdr", fontName="Helvetica-Bold", textColor=colors.white),
            ),
            Paragraph(
                "<b>Amount (INR)</b>",
                ParagraphStyle(
                    "Hdr", fontName="Helvetica-Bold", textColor=colors.white, alignment=2
                ),
            ),
        ],
        [
            Paragraph(f"Gym Membership ({plan_str})", body_style),
            Paragraph(f"{plan_duration.capitalize() if plan_duration else 'N/A'}", body_style),
            Paragraph(f"₹{amount:,.2f}", ParagraphStyle("Amt", fontName="Helvetica", alignment=2)),
        ],
        [
            Paragraph("<b>Total Paid:</b>", bold_style),
            "",
            Paragraph(
                f"<b>₹{amount:,.2f}</b>",
                ParagraphStyle("Tot", fontName="Helvetica-Bold", alignment=2),
            ),
        ],
    ]
    items_table = Table(items_data, colWidths=[280, 120, 120])
    items_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), garage_dark),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (2, 0), (2, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.5, garage_mid),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(items_table)
    story.append(Spacer(1, 30))

    # Footer Notes
    story.append(
        Paragraph(
            "Thank you for training with Fitness Garage!",
            ParagraphStyle(
                "Foot", fontName="Helvetica-Oblique", fontSize=9, textColor=garage_mid, alignment=1
            ),
        )
    )

    doc.build(story)
    return buffer.getvalue()


async def upload_invoice_to_storage(member_id: UUID, payment_id: UUID, pdf_bytes: bytes) -> str:
    """
    Uploads invoice to Supabase Storage private bucket 'invoices' or saves locally.
    Returns the storage path e.g. invoices/<member_id>/<payment_id>.pdf
    """
    storage_path = f"invoices/{member_id}/{payment_id}.pdf"
    try:
        from supabase import create_client

        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
            client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            path_in_bucket = f"{member_id}/{payment_id}.pdf"
            client.storage.from_("invoices").upload(
                path=path_in_bucket,
                file=pdf_bytes,
                file_options={"content-type": "application/pdf", "upsert": "true"},
            )
            logger.info(f"Uploaded invoice to Supabase storage: {storage_path}")
            return storage_path
    except Exception as e:
        logger.warning(f"Failed to upload invoice to Supabase storage: {e}")

    return storage_path
