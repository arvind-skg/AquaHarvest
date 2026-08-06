import joblib
import pandas as pd
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent.parent / "ml" / "model.pkl"

# Reason templates for explainability
REASON_TEMPLATES = {
    "Storage Tank": (
        "Based on your {roof_area:.0f} m² roof and {rainfall:.0f} mm annual rainfall, "
        "the site has strong water harvesting potential ({water_potential:.0f} L/yr). "
        "With limited open space ({open_space} m²) and {occupants} occupants, "
        "a Storage Tank is the most practical solution for daily water security."
    ),
    "Recharge Pit": (
        "Your site has {open_space} m² of available open space and {soil_type} soil, "
        "which enables fast groundwater infiltration. "
        "A Recharge Pit is recommended to maximize artificial groundwater recharge "
        "from your {roof_area:.0f} m² roof catchment."
    ),
    "Recharge Well": (
        "The groundwater level at {groundwater_depth} m depth and limited surface space ({open_space} m²) "
        "make a Recharge Well the most efficient option. "
        "It directly channels harvested water from your {roof_area:.0f} m² roof into the aquifer."
    ),
    "Recharge Trench": (
        "With {soil_type} soil and moderate rainfall ({rainfall:.0f} mm/yr), "
        "a Recharge Trench offers the most cost-effective solution. "
        "It distributes water across your available space for slow, steady infiltration."
    ),
    "Storage Tank + Recharge Pit": (
        "Your large {roof_area:.0f} m² roof with {rainfall:.0f} mm annual rainfall yields "
        "{water_potential:.0f} L/yr — enough for both storage and recharge. "
        "A hybrid system (Storage Tank + Recharge Pit) is recommended to serve {occupants} "
        "occupants while also recharging groundwater."
    ),
}


def build_reason(method, payload, water_potential):
    template = REASON_TEMPLATES.get(method, "Recommended based on site analysis.")
    return template.format(
        roof_area=float(payload.get("roof_length", 0)) * float(payload.get("roof_width", 0)),
        rainfall=float(payload.get("rainfall", 800)),
        water_potential=water_potential,
        open_space=float(payload.get("open_space", 20)),
        occupants=int(payload.get("occupants", 4)),
        soil_type=payload.get("soil_type", "Sandy"),
        groundwater_depth=float(payload.get("groundwater_level", 10)),
    )


def recommend_method(payload):
    """
    Load trained Random Forest model and predict the best harvesting method.
    Returns (method_name, confidence_score).
    Falls back to rule-based prediction if model unavailable.
    """
    if not MODEL_PATH.exists():
        return _rule_based_fallback(payload), 0.75

    try:
        model = joblib.load(MODEL_PATH)

        features = {
            "roof_area": float(payload.get("roof_length", 0)) * float(payload.get("roof_width", 0)),
            "roof_type": payload.get("roof_type", "Flat"),
            "roof_material": payload.get("roof_material", "Concrete"),
            "building_type": payload.get("property_type", "Residential"),
            "annual_rainfall": float(payload.get("rainfall", 800)),
            "soil_type": payload.get("soil_type", "Sandy"),
            "groundwater_level": float(payload.get("groundwater_level", 10)),
            "open_space": float(payload.get("open_space", 20)),
            "occupants": int(payload.get("occupants", 4)),
            "budget": float(payload.get("budget", 500000)),
        }

        df = pd.DataFrame([features])
        encoded = pd.get_dummies(df, columns=["roof_type", "roof_material", "building_type", "soil_type"])

        if hasattr(model, "feature_names_in_"):
            for col in model.feature_names_in_:
                if col not in encoded.columns:
                    encoded[col] = 0
            encoded = encoded[model.feature_names_in_]

        prediction = model.predict(encoded)[0]
        # Get confidence (probability of chosen class)
        proba = model.predict_proba(encoded)[0]
        confidence = round(float(max(proba)), 3)
        return prediction, confidence

    except Exception as e:
        print(f"ML model error: {e}, falling back to rule-based")
        return _rule_based_fallback(payload), 0.70


def _rule_based_fallback(payload):
    """Engineering rule-based fallback recommendation."""
    roof_area = float(payload.get("roof_length", 0)) * float(payload.get("roof_width", 0))
    rainfall = float(payload.get("rainfall", 800))
    soil_type = payload.get("soil_type", "Sandy")
    open_space = float(payload.get("open_space", 20))
    groundwater_level = float(payload.get("groundwater_level", 10))
    budget = float(payload.get("budget", 500000))

    if open_space < 10 or groundwater_level > 30:
        return "Recharge Well"
    if soil_type in ("Sandy", "Gravelly") and open_space > 20:
        if roof_area > 400 and rainfall > 1000:
            return "Storage Tank + Recharge Pit"
        return "Recharge Pit"
    if roof_area > 400 and rainfall > 1000 and budget > 100000:
        return "Storage Tank + Recharge Pit"
    if rainfall < 600 or open_space < 15:
        return "Storage Tank"
    if soil_type == "Clayey":
        return "Recharge Trench"
    return "Storage Tank"
