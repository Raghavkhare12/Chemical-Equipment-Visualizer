from django.urls import path
from .views import UploadCSVView, HistoryView, DownloadReportView
from . import views

urlpatterns = [
    path("upload/", UploadCSVView.as_view()),
    path("health/", views.health),
    path("history/", HistoryView.as_view()),
    path("report/", DownloadReportView.as_view()),

]
