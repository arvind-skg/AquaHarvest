def calculate_assessment(payload, method):
    """
    Engineering calculation engine.
    All numbers come from here — NOT from the AI/ML model.
    """
    roof_length = float(payload.get("roof_length", 0))
    roof_width = float(payload.get("roof_width", 0))
    rainfall = float(payload.get("rainfall", 0))
    open_space = float(payload.get("open_space", 20))
    occupants = int(payload.get("occupants", 4))
    budget = float(payload.get("budget", 500000))

    roof_area = roof_length * roof_width

    # Runoff coefficient based on roof material
    roof_material = payload.get("roof_material", "Concrete")
    runoff_map = {
        "Concrete": 0.85,
        "Metal": 0.90,
        "Tile": 0.75,
        "Asbestos": 0.80,
    }
    runoff_coefficient = runoff_map.get(roof_material, 0.80)

    # Water harvesting potential (litres per year)
    # Formula: Area(m²) × Rainfall(mm) × Runoff_coeff × 1 (1mm = 1L/m²)
    water_potential = roof_area * rainfall * runoff_coefficient

    # Daily demand: 135 L/person/day (IS standard)
    daily_demand = occupants * 135
    # Storage needed for 30 dry days
    storage_needed_litres = daily_demand * 30

    # Tank capacity in m³ (1 m³ = 1000 L)
    tank_capacity = round(min(storage_needed_litres / 1000, water_potential * 0.25 / 1000), 2)
    tank_capacity = max(tank_capacity, 1.0)  # minimum 1 m³

    # Recharge pit dimensions
    # Volume needed = 10% of annual potential (in m³)
    pit_volume = water_potential * 0.10 / 1000
    pit_depth = 2.0  # standard
    pit_area = pit_volume / pit_depth
    pit_length = round(max(2.0, min(8.0, (pit_area ** 0.5))), 2)
    pit_width = round(max(2.0, min(6.0, pit_area / pit_length)), 2)

    # Cost estimates (INR)
    cost_per_m3_tank = 4500      # RCC tank
    cost_per_m3_pit = 2000       # Recharge pit
    cost_per_m_trench = 800      # Per meter of trench
    cost_recharge_well = 45000   # Fixed well cost
    installation_overhead = 5000

    if method == "Storage Tank":
        estimated_cost = round(tank_capacity * 1000 * cost_per_m3_tank / 1000 + installation_overhead, 0)
        estimated_cost = max(estimated_cost, 15000)
    elif method == "Recharge Pit":
        pit_vol_actual = pit_length * pit_width * pit_depth
        estimated_cost = round(pit_vol_actual * cost_per_m3_pit + installation_overhead, 0)
        estimated_cost = max(estimated_cost, 12000)
    elif method == "Recharge Well":
        estimated_cost = round(cost_recharge_well + installation_overhead, 0)
    elif method == "Recharge Trench":
        trench_length = max(5, roof_area / 20)
        estimated_cost = round(trench_length * cost_per_m_trench + installation_overhead, 0)
        estimated_cost = max(estimated_cost, 10000)
    else:  # Storage Tank + Recharge Pit
        tank_cost = max(tank_capacity * 1000 * cost_per_m3_tank / 1000, 15000)
        pit_cost = pit_length * pit_width * pit_depth * cost_per_m3_pit
        estimated_cost = round(tank_cost + pit_cost + installation_overhead * 1.5, 0)

    # Cap cost at budget (with a warning flag)
    within_budget = estimated_cost <= budget

    return {
        "roof_area": round(roof_area, 2),
        "water_potential": round(water_potential, 2),
        "tank_capacity": tank_capacity,
        "pit_length": pit_length,
        "pit_width": pit_width,
        "pit_depth": pit_depth,
        "estimated_cost": round(estimated_cost, 0),
        "within_budget": within_budget,
        "runoff_coefficient": runoff_coefficient,
        "daily_demand_litres": daily_demand,
        "annual_savings_inr": round(water_potential * 0.05, 0),  # ₹5 per 1000L saved
    }
