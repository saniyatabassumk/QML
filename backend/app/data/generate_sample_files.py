"""
Generate sample PDF and XLSX medical reports for RheumaSense AI testing
"""

import os
from pathlib import Path
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

SAMPLE_DIR = Path(__file__).resolve().parent / "sample_reports"
SAMPLE_DIR.mkdir(parents=True, exist_ok=True)


def create_sample_ra_pdf():
    pdf_path = SAMPLE_DIR / "lab_report_positive_ra.pdf"
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    elements = []
    title_style = ParagraphStyle("H", parent=styles["Heading1"], fontSize=16, leading=20, textColor=colors.HexColor("#0284c7"))
    meta_style = ParagraphStyle("M", parent=styles["Normal"], fontSize=10, leading=14, textColor=colors.HexColor("#334155"))
    
    elements.append(Paragraph("<b>METROPOLITAN CLINICAL LABORATORY</b>", title_style))
    elements.append(Paragraph("Patient Name: Jane Doe &nbsp;&nbsp;|&nbsp;&nbsp; Age: 45 Years &nbsp;&nbsp;|&nbsp;&nbsp; Gender: Female", meta_style))
    elements.append(Paragraph("Referring Physician: Dr. K. Sharma &nbsp;&nbsp;|&nbsp;&nbsp; Date: Oct 24, 2026", meta_style))
    elements.append(Spacer(1, 15))

    data = [
        ["Test Name", "Observed Result", "Unit", "Biological Reference Range"],
        ["Erythrocyte Sedimentation Rate (ESR)", "32", "mm/hr", "0 - 20"],
        ["C-Reactive Protein (CRP)", "12.5", "mg/L", "0 - 5.0"],
        ["Rheumatoid Factor (RF Quantitative)", "78", "IU/mL", "0 - 14"],
        ["Anti-Cyclic Citrullinated Peptide (Anti-CCP)", ">200", "U/mL", "0 - 20"],
        ["Antinuclear Antibodies (ANA IFA)", "Positive", "-", "Negative"],
        ["Complement C3", "90", "mg/dL", "90 - 180"],
        ["Complement C4", "18", "mg/dL", "10 - 40"],
    ]

    t = Table(data, colWidths=[240, 100, 70, 130])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("<b>End of Laboratory Report</b>", meta_style))
    doc.build(elements)
    print(f"Created {pdf_path}")


def create_sample_normal_pdf():
    pdf_path = SAMPLE_DIR / "lab_report_normal.pdf"
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    elements = []
    title_style = ParagraphStyle("H", parent=styles["Heading1"], fontSize=16, leading=20, textColor=colors.HexColor("#0284c7"))
    meta_style = ParagraphStyle("M", parent=styles["Normal"], fontSize=10, leading=14, textColor=colors.HexColor("#334155"))
    
    elements.append(Paragraph("<b>CITY HEALTH DIAGNOSTICS</b>", title_style))
    elements.append(Paragraph("Patient Name: Robert Smith &nbsp;&nbsp;|&nbsp;&nbsp; Age: 38 Years &nbsp;&nbsp;|&nbsp;&nbsp; Gender: Male", meta_style))
    elements.append(Paragraph("Date: Oct 24, 2026", meta_style))
    elements.append(Spacer(1, 15))

    data = [
        ["Test Name", "Observed Result", "Unit", "Biological Reference Range"],
        ["Erythrocyte Sedimentation Rate (ESR)", "8", "mm/hr", "0 - 15"],
        ["C-Reactive Protein (CRP)", "1.2", "mg/L", "0 - 5.0"],
        ["Rheumatoid Factor (RF)", "6.2", "IU/mL", "0 - 14"],
        ["Anti-CCP", "5.1", "U/mL", "0 - 20"],
        ["Antinuclear Antibodies (ANA)", "Negative", "-", "Negative"],
        ["Complement C3", "130", "mg/dL", "90 - 180"],
        ["Complement C4", "28", "mg/dL", "10 - 40"],
    ]

    t = Table(data, colWidths=[240, 100, 70, 130])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("<b>End of Laboratory Report</b>", meta_style))
    doc.build(elements)
    print(f"Created {pdf_path}")


def create_sample_spreadsheet():
    xlsx_path = SAMPLE_DIR / "lab_report_data.xlsx"
    df = pd.DataFrame([
        {"Test": "Age", "Result": 45, "Unit": "years", "Reference": "-"},
        {"Test": "Gender", "Result": "Female", "Unit": "-", "Reference": "-"},
        {"Test": "ESR", "Result": 32, "Unit": "mm/hr", "Reference": "0 - 20"},
        {"Test": "CRP", "Result": 12.5, "Unit": "mg/L", "Reference": "0 - 5"},
        {"Test": "RF", "Result": 78, "Unit": "IU/mL", "Reference": "0 - 14"},
        {"Test": "Anti-CCP", "Result": 200, "Unit": "U/mL", "Reference": "0 - 20"},
        {"Test": "ANA", "Result": "Positive", "Unit": "-", "Reference": "Negative"},
        {"Test": "Complement C3", "Result": 90, "Unit": "mg/dL", "Reference": "90 - 180"},
        {"Test": "Complement C4", "Result": 18, "Unit": "mg/dL", "Reference": "10 - 40"}
    ])
    df.to_excel(str(xlsx_path), index=False)
    print(f"Created {xlsx_path}")


if __name__ == "__main__":
    create_sample_ra_pdf()
    create_sample_normal_pdf()
    create_sample_spreadsheet()
