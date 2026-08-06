from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Assessment, Result
from .serializers import AssessmentSerializer, AssessmentCreateSerializer, ResultSerializer
from services.calculation_engine import calculate_assessment
from services.recommendation_service import recommend_method, build_reason
from services.pdf_service import generate_report_pdf


@api_view(["GET"])
def assessment_list(request):
    """GET /api/assessment/ — list all assessments with nested results."""
    assessments = Assessment.objects.all().order_by("-created_at")
    serializer = AssessmentSerializer(assessments, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def create_assessment(request):
    """POST /api/assessment/create/ — create assessment only (no prediction)."""
    serializer = AssessmentCreateSerializer(data=request.data)
    if serializer.is_valid():
        assessment = serializer.save()
        return Response(
            {"id": assessment.id, "message": "Assessment created successfully."},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def assessment_detail(request, pk):
    """GET /api/assessment/<id>/ — get one assessment with result."""
    try:
        assessment = Assessment.objects.get(pk=pk)
    except Assessment.DoesNotExist:
        return Response({"detail": "Assessment not found."}, status=status.HTTP_404_NOT_FOUND)
    serializer = AssessmentSerializer(assessment)
    return Response(serializer.data)


@api_view(["POST"])
def predict_method_only(request):
    """POST /api/predict/ — run ML prediction + calculation without saving."""
    payload = request.data
    method, confidence = recommend_method(payload)
    result_data = calculate_assessment(payload, method)
    reason = build_reason(method, payload, result_data["water_potential"])
    return Response({
        "recommended_method": method,
        "confidence_score": confidence,
        "recommendation_reason": reason,
        "result": result_data,
    })


@api_view(["POST"])
def create_full_assessment(request):
    """
    POST /api/assessment/complete/
    Main endpoint: save assessment + run ML + run calculations + save result.
    Returns full data for Results page.
    """
    serializer = AssessmentCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    assessment = serializer.save()
    payload = request.data

    # Step 1: ML recommendation
    method, confidence = recommend_method(payload)

    # Step 2: Engineering calculations
    result_data = calculate_assessment(payload, method)

    # Step 3: Build human-readable reason
    reason = build_reason(method, payload, result_data["water_potential"])

    # Step 4: Save result
    result = Result.objects.create(
        assessment=assessment,
        recommended_method=method,
        water_potential=result_data["water_potential"],
        tank_capacity=result_data["tank_capacity"],
        pit_length=result_data["pit_length"],
        pit_width=result_data["pit_width"],
        pit_depth=result_data["pit_depth"],
        estimated_cost=result_data["estimated_cost"],
        recommendation_reason=reason,
        confidence_score=confidence,
    )

    return Response(
        {
            "id": assessment.id,
            "recommended_method": method,
            "confidence_score": confidence,
            "recommendation_reason": reason,
            "result": result_data,
            "assessment": AssessmentSerializer(assessment).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def report_detail(request, pk):
    """GET /api/report/<id>/ — get result JSON for an assessment."""
    try:
        assessment = Assessment.objects.get(pk=pk)
        result = assessment.result
    except Assessment.DoesNotExist:
        return Response({"detail": "Assessment not found."}, status=status.HTTP_404_NOT_FOUND)
    except Result.DoesNotExist:
        return Response({"detail": "No result found for this assessment."}, status=status.HTTP_404_NOT_FOUND)
    return Response(ResultSerializer(result).data)


@api_view(["GET"])
def download_pdf(request, pk):
    """GET /api/report/<id>/pdf/ — download PDF report."""
    try:
        assessment = Assessment.objects.get(pk=pk)
        result = assessment.result
    except Assessment.DoesNotExist:
        return Response({"detail": "Assessment not found."}, status=status.HTTP_404_NOT_FOUND)
    except Result.DoesNotExist:
        return Response({"detail": "No result for this assessment."}, status=status.HTTP_404_NOT_FOUND)

    buffer = generate_report_pdf(assessment, result)
    filename = f"AquaHarvest_Report_{assessment.id}_{assessment.district}.pdf"
    response = HttpResponse(buffer, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response
