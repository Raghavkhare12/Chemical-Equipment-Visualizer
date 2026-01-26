from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Dataset
from .utils import analyze_csv


class UploadCSVView(APIView):

    def post(self, request):
        file = request.FILES.get("file")

        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        summary = analyze_csv(file)

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
