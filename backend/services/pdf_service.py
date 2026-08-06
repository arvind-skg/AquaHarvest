from io import BytesIO
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

TEAL = colors.HexColor("#0d9488")
DARK = colors.HexColor("#0f172a")
LIGHT_BG = colors.HexColor("#f0fdfa")
ACCENT = colors.HexColor("#06b6d4")
WHITE = colors.white
GRAY = colors.HexColor("#64748b")


def generate_report_pdf(assessment, result):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "Title",
        parent=styles["Heading1"],
        fontSize=24,
        textColor=TEAL,
        spaceAfter=4,
        alignment=TA_CENTER,
        fontName="Helvetica-Bold",
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=GRAY,
        spaceAfter=20,
        alignment=TA_CENTER,
    )
    section_style = ParagraphStyle(
        "Section",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=DARK,
        spaceBefore=16,
        spaceAfter=6,
        fontName="Helvetica-Bold",
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=10,
        textColor=DARK,
        spaceAfter=4,
        leading=16,
    )
    highlight_style = ParagraphStyle(
        "Highlight",
        parent=styles["Normal"],
        fontSize=14,
        textColor=TEAL,
        fontName="Helvetica-Bold",
        spaceAfter=8,
    )

    story = []

    # Header
    story.append(Paragraph("🌧 AquaHarvest", title_style))
    story.append(Paragraph("AI-Assisted Rooftop Rainwater Harvesting Assessment Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=TEAL))
    story.append(Spacer(1, 16))

    # Meta info
    story.append(Paragraph(f"Report Generated: {datetime.now().strftime('%d %B %Y, %I:%M %p IST')}", body_style))
    story.append(Paragraph(f"Assessment ID: #{assessment.id}", body_style))
    story.append(Spacer(1, 12))

    # Property Details
    story.append(Paragraph("Property Details", section_style))
    prop_data = [
        ["Owner Name", assessment.owner_name],
        ["Building Name", assessment.building_name],
        ["Address", assessment.address],
        ["District", assessment.district],
        ["Property Type", assessment.property_type],
    ]
    prop_table = Table(prop_data, colWidths=[5 * cm, 12 * cm])
    prop_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("TEXTCOLOR", (0, 0), (0, -1), TEAL),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (1, 0), (1, -1), [WHITE, LIGHT_BG]),
    ]))
    story.append(prop_table)

    # Site Details
    story.append(Paragraph("Site & Roof Details", section_style))
    site_data = [
        ["Roof Length", f"{assessment.roof_length} m"],
        ["Roof Width", f"{assessment.roof_width} m"],
        ["Roof Area", f"{assessment.roof_area} m²"],
        ["Roof Material", assessment.roof_material],
        ["Roof Type", assessment.roof_type],
        ["Annual Rainfall", f"{assessment.rainfall} mm"],
        ["Soil Type", assessment.soil_type],
        ["Groundwater Level", f"{assessment.groundwater_level} m depth"],
        ["Available Open Space", f"{assessment.open_space} m²"],
        ["Number of Occupants", str(assessment.occupants)],
        ["Budget", f"₹{assessment.budget:,.0f}"],
    ]
    site_table = Table(site_data, colWidths=[5 * cm, 12 * cm])
    site_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("TEXTCOLOR", (0, 0), (0, -1), TEAL),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(site_table)

    # AI Recommendation
    story.append(Paragraph("AI Recommendation", section_style))
    story.append(Paragraph(f"Recommended Method: {result.recommended_method}", highlight_style))
    story.append(Paragraph(result.recommendation_reason, body_style))
    story.append(Spacer(1, 8))
    conf_pct = f"{result.confidence_score * 100:.0f}%" if result.confidence_score > 0 else "N/A"
    story.append(Paragraph(f"Model Confidence: {conf_pct}", body_style))

    # Engineering Calculations
    story.append(Paragraph("Engineering Calculations", section_style))
    calc_data = [
        ["Parameter", "Calculated Value"],
        ["Roof Catchment Area", f"{result.water_potential / assessment.rainfall / 0.8:.0f} m²"],
        ["Annual Water Potential", f"{result.water_potential:,.0f} L ({result.water_potential / 1000:.1f} m³)"],
        ["Recommended Tank Capacity", f"{result.tank_capacity} m³"],
        ["Recharge Pit — Length", f"{result.pit_length} m"],
        ["Recharge Pit — Width", f"{result.pit_width} m"],
        ["Recharge Pit — Depth", f"{result.pit_depth} m"],
        ["Estimated Cost", f"₹{result.estimated_cost:,.0f}"],
    ]
    calc_table = Table(calc_data, colWidths=[8 * cm, 9 * cm])
    calc_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEAL),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
    ]))
    story.append(calc_table)

    # Footer
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=GRAY))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "Generated by AquaHarvest | Calculations based on IS 15797 standards",
        ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=GRAY, alignment=TA_CENTER)
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer
