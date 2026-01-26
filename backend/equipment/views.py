from .utils import generate_pdf_report
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
import os
from django.conf import settings


from .models import Dataset
from .utils import analyze_csv


class UploadCSVView(APIView):

    def post(self, request):
        file = request.FILES.get("file")

        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        summary = analyze_csv(file)
        generate_pdf_report(summary, "latest_report.pdf")


        Dataset.objects.create(
            file_name=file.name,
            summary=summary
        )

        # Keep only last 5 datasets
        if Dataset.objects.count() > 5:
            Dataset.objects.order_by("uploaded_at").first().delete()

        return Response(summary, status=200)


class HistoryView(APIView):

    def get(self, request):
        datasets = Dataset.objects.order_by("-uploaded_at").values()
        return Response(datasets)

class DownloadReportView(APIView):
    def get(self, request):
        file_path = os.path.join(settings.BASE_DIR, "latest_report.pdf")

        if not os.path.exists(file_path):
            return Response({"error": "Report not found"}, status=404)

        return FileResponse(open(file_path, "rb"), content_type="application/pdf")
