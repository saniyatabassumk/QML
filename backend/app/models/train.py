"""
Master Model Training Script for RheumaSense AI
Trains Classical (7-Class Ensemble) and Quantum (PennyLane VQC)
"""

import os
import json
import pandas as pd
from pathlib import Path
from app.config import DATASET_PATH, MODELS_DIR
from app.models.dataset_generator import generate_dataset
from app.models.classical_model import AutoimmuneModelSuite
from app.models.qml_model import QuantumRAClassifier


def train_all_models():
    print(f"Loading dataset from: {DATASET_PATH}")
    if not DATASET_PATH.exists():
        print("Dataset not found. Generating...")
        df = generate_dataset()
    else:
        df = pd.read_excel(DATASET_PATH)

    print(f"Dataset loaded: {len(df)} samples across {df['diagnosis'].nunique()} classes.")

    # 1. Train Classical Models
    print("Training Classical Autoimmune Classification Suite (Random Forest & Logistic Regression)...")
    classical_suite = AutoimmuneModelSuite()
    classical_metrics = classical_suite.fit(df)
    classical_save_path = MODELS_DIR / "classical_suite.joblib"
    classical_suite.save(str(classical_save_path))
    print(f"Classical models saved to: {classical_save_path}")
    print(f"Random Forest Test Accuracy: {classical_metrics['random_forest']['accuracy'] * 100:.2f}%")

    # 2. Train Quantum Model
    print("Training PennyLane Variational Quantum Classifier (VQC) with default.qubit (4 Qubits)...")
    qml_model = QuantumRAClassifier(n_qubits=4, n_layers=2)
    X, _ = classical_suite._encode_dataframe(df)
    y_is_ra = df["is_ra"].values
    
    # Train QML
    qml_metrics = qml_model.fit(X, y_is_ra, epochs=25, lr=0.15)
    qml_save_path = MODELS_DIR / "qml_model.json"
    qml_model.save(str(qml_save_path))
    print(f"Quantum model saved to: {qml_save_path}")
    print(f"Quantum Model Accuracy: {qml_metrics['accuracy'] * 100:.2f}%")

    # 3. Save Combined Evaluation Metrics
    eval_results = {
        "dataset": {
            "samples": len(df),
            "classes": df["diagnosis"].unique().tolist(),
            "target_column": "diagnosis"
        },
        "classical": classical_metrics,
        "quantum": {
            "paradigm": "Quantum Machine Learning (PennyLane VQC)",
            "simulator": "default.qubit",
            "n_qubits": 4,
            "n_layers": 2,
            "accuracy": qml_metrics["accuracy"],
            "explained_variance_ratio": qml_metrics["explained_variance_ratio"]
        }
    }

    eval_path = MODELS_DIR / "evaluation_results.json"
    with open(eval_path, "w", encoding="utf-8") as f:
        json.dump(eval_results, f, indent=2)

    print(f"Evaluation report saved to: {eval_path}")
    return eval_results


if __name__ == "__main__":
    train_all_models()
