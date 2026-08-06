from django.db import models


class Assessment(models.Model):
    PROPERTY_CHOICES = [
        ("Residential", "Residential"),
        ("Commercial", "Commercial"),
        ("Institutional", "Institutional"),
        ("Industrial", "Industrial"),
    ]
    ROOF_MATERIAL_CHOICES = [
        ("Concrete", "Concrete"),
        ("Metal", "Metal"),
        ("Tile", "Tile"),
        ("Asbestos", "Asbestos"),
    ]
    ROOF_TYPE_CHOICES = [
        ("Flat", "Flat"),
        ("Pitched", "Pitched"),
        ("Sloped", "Sloped"),
    ]
    SOIL_TYPE_CHOICES = [
        ("Sandy", "Sandy"),
        ("Clayey", "Clayey"),
        ("Loamy", "Loamy"),
        ("Gravelly", "Gravelly"),
    ]

    owner_name = models.CharField(max_length=200)
    building_name = models.CharField(max_length=200)
    address = models.CharField(max_length=500)
    district = models.CharField(max_length=200)
    property_type = models.CharField(max_length=100, choices=PROPERTY_CHOICES, default="Residential")
    roof_length = models.FloatField()
    roof_width = models.FloatField()
    roof_material = models.CharField(max_length=100, choices=ROOF_MATERIAL_CHOICES, default="Concrete")
    roof_type = models.CharField(max_length=100, choices=ROOF_TYPE_CHOICES, default="Flat")
    rainfall = models.FloatField(help_text="Annual rainfall in mm")
    soil_type = models.CharField(max_length=100, choices=SOIL_TYPE_CHOICES, default="Sandy")
    groundwater_level = models.FloatField(default=10, help_text="Depth to groundwater in meters")
    open_space = models.FloatField(default=20, help_text="Available open space in m²")
    occupants = models.IntegerField(default=4)
    budget = models.FloatField(default=500000, help_text="Budget in INR")
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.building_name} — {self.owner_name}"

    @property
    def roof_area(self):
        return round(self.roof_length * self.roof_width, 2)


class Result(models.Model):
    assessment = models.OneToOneField(Assessment, on_delete=models.CASCADE, related_name="result")
    recommended_method = models.CharField(max_length=100)
    water_potential = models.FloatField()
    tank_capacity = models.FloatField(default=0)
    pit_length = models.FloatField(default=0)
    pit_width = models.FloatField(default=0)
    pit_depth = models.FloatField(default=0)
    estimated_cost = models.FloatField(default=0)
    recommendation_reason = models.TextField()
    confidence_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Result for {self.assessment.building_name}: {self.recommended_method}"
