from django.urls import path
from .views import (
    assessment_list,
    create_assessment,
    assessment_detail,
    predict_method_only,
    create_full_assessment,
    report_detail,
    download_pdf,
)

urlpatterns = [
    path("assessment/", assessment_list, name="assessment-list"),
    path("assessment/create/", create_assessment, name="assessment-create"),
    path("assessment/complete/", create_full_assessment, name="assessment-complete"),
    path("assessment/<int:pk>/", assessment_detail, name="assessment-detail"),
    path("predict/", predict_method_only, name="predict-method"),
    path("report/<int:pk>/", report_detail, name="report-detail"),
    path("report/<int:pk>/pdf/", download_pdf, name="download-pdf"),
]
