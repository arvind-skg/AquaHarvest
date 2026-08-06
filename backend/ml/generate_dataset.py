import pandas as pd
import numpy as np
from pathlib import Path

OUTPUT_PATH = Path(__file__).resolve().parents[1] / ".." / "datasets" / "recommendation_dataset.csv"


def generate_dataset(n=5000):
    rng = np.random.default_rng(42)
    rows = []
    for _ in range(n):
        roof_area = float(rng.integers(80, 900))
        roof_type = rng.choice(["Flat", "Pitched"])
        roof_material = rng.choice(["Concrete", "Metal", "Tile"])
        building_type = rng.choice(["Residential", "Commercial", "Institutional"])
        annual_rainfall = float(rng.integers(600, 1400))
        soil_type = rng.choice(["Sandy", "Clayey", "Loamy"])
        groundwater_level = float(rng.integers(4, 18))
        open_space = float(rng.integers(5, 60))
        occupants = int(rng.integers(2, 25))
        budget = float(rng.choice([300000, 500000, 800000, 1000000, 1200000, 1500000]))

        if soil_type == "Sandy" and open_space > 20:
            method = "Recharge Pit"
        elif roof_area > 400 and annual_rainfall > 1000:
            method = "Storage Tank + Recharge Pit"
        elif open_space < 10:
            method = "Recharge Well"
        elif roof_area > 300 and annual_rainfall > 900:
            method = "Storage Tank"
        elif soil_type == "Clayey":
            method = "Recharge Trench"
        else:
            method = "Recharge Pit"

        rows.append({
            "roof_area": roof_area,
            "roof_type": roof_type,
            "roof_material": roof_material,
            "building_type": building_type,
            "annual_rainfall": annual_rainfall,
            "soil_type": soil_type,
            "groundwater_level": groundwater_level,
            "open_space": open_space,
            "occupants": occupants,
            "budget": budget,
            "recommended_method": method,
        })

    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Saved {len(df)} rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    generate_dataset()
