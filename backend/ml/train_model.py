import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

DATASET_PATH = Path(__file__).resolve().parents[1] / ".." / "datasets" / "recommendation_dataset.csv"
MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"


def train_and_save_model():
    df = pd.read_csv(DATASET_PATH)
    X = df.drop(columns=["recommended_method"])
    y = df["recommended_method"]

    X = pd.get_dummies(X, columns=["roof_type", "roof_material", "building_type", "soil_type"])
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, preds))
    joblib.dump(model, MODEL_PATH)
    print("Model saved to", MODEL_PATH)


if __name__ == "__main__":
    train_and_save_model()
