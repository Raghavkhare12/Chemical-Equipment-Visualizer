import pandas as pd
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os
from django.conf import settings

def generate_pdf_report(summary, filename="report.pdf"):
    file_path = os.path.join(settings.BASE_DIR, filename)

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    y = height - 50

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "Chemical Equipment Analysis Report")

    y -= 40
    c.setFont("Helvetica", 12)

    c.drawString(50, y, f"Total Equipment: {summary['total_count']}")
    y -= 25
    c.drawString(50, y, f"Average Flowrate: {summary['avg_flowrate']}")
    y -= 25
    c.drawString(50, y, f"Average Pressure: {summary['avg_pressure']}")
    y -= 25
    c.drawString(50, y, f"Average Temperature: {summary['avg_temperature']}")

    y -= 40
    c.drawString(50, y, "Equipment Type Distribution:")
    y -= 25

    for k, v in summary["type_distribution"].items():
        c.drawString(70, y, f"{k}: {v}")
        y -= 20

    c.showPage()
    c.save()

    return file_path

def analyze_csv(file):
    df = pd.read_csv(file)

    summary = {
        "total_count": int(len(df)),
        "avg_flowrate": round(df["Flowrate"].mean(), 2),
        "avg_pressure": round(df["Pressure"].mean(), 2),
        "avg_temperature": round(df["Temperature"].mean(), 2),
        "type_distribution": df["Type"].value_counts().to_dict(),
        "rows": df.to_dict(orient="records")  # 👈 ADD THIS
    }

    return summary
