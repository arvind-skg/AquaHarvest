from rest_framework import serializers
from .models import Assessment, Result


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = "__all__"


class AssessmentSerializer(serializers.ModelSerializer):
    result = ResultSerializer(read_only=True)
    roof_area = serializers.FloatField(read_only=True)

    class Meta:
        model = Assessment
        fields = "__all__"


class AssessmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = [
            "owner_name",
            "building_name",
            "address",
            "district",
            "property_type",
            "roof_length",
            "roof_width",
            "roof_material",
            "roof_type",
            "rainfall",
            "soil_type",
            "groundwater_level",
            "open_space",
            "occupants",
            "budget",
            "latitude",
            "longitude",
        ]
