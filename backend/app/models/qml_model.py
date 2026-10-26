"""
PennyLane Variational Quantum Classifier (VQC) for Rheumatoid Arthritis Screening
================================================================================
Uses default.qubit simulator with PCA angle embedding.
Architecture:
- 4 Qubits
- 2 Variational Layers (General Euler Rotations + Circular CNOT entanglement)
- Measurement: Expectation value of Pauli-Z on Qubit 0
- Calibrated binary classification output
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
import pennylane as qml
from pennylane import numpy as pnp
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler, MinMaxScaler


class QuantumRAClassifier:
    """
    4-Qubit Variational Quantum Classifier using PennyLane.
    """

    def __init__(self, n_qubits: int = 4, n_layers: int = 2, dev_name: str = "default.qubit"):
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        self.dev_name = dev_name
        self.dev = qml.device(dev_name, wires=n_qubits)
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=n_qubits, random_state=42)
        self.angle_scaler = MinMaxScaler(feature_range=(-np.pi, np.pi))
        self.weights = None
        self.bias = 0.0
        self.scale = 1.0
        self.is_trained = False
        self._build_qnode()

    def _build_qnode(self):
        @qml.qnode(self.dev, interface="autograd", diff_method="backprop")
        def circuit(weights, features):
            # 1. State preparation (Ry angle embedding)
            for i in range(self.n_qubits):
                qml.RY(features[i], wires=i)

            # 2. Variational Ansatz
            for l in range(self.n_layers):
                for i in range(self.n_qubits):
                    qml.Rot(
                        weights[l, i, 0],
                        weights[l, i, 1],
                        weights[l, i, 2],
                        wires=i
                    )
                for i in range(self.n_qubits):
                    qml.CNOT(wires=[i, (i + 1) % self.n_qubits])

            # 3. Readout observable: Pauli-Z on wire 0
            return qml.expval(qml.PauliZ(0))

        self.circuit_qnode = circuit

    def initialize_weights(self, seed: int = 42):
        np.random.seed(seed)
        self.weights = 0.05 * np.random.randn(self.n_layers, self.n_qubits, 3)
        self.bias = 0.0
        self.scale = 1.0

    def fit_preprocessor(self, X: np.ndarray):
        scaled = self.scaler.fit_transform(X)
        pca_feat = self.pca.fit_transform(scaled)
        self.angle_scaler.fit(pca_feat)

    def transform_to_angles(self, X: np.ndarray) -> np.ndarray:
        scaled = self.scaler.transform(X)
        pca_feat = self.pca.transform(scaled)
        angles = self.angle_scaler.transform(pca_feat)
        return angles

    def fit(self, X: np.ndarray, y_is_ra: np.ndarray, epochs: int = 30, lr: float = 0.1) -> Dict[str, Any]:
        """Train variational weights using gradient descent."""
        self.fit_preprocessor(X)
        angles = self.transform_to_angles(X)
        self.initialize_weights()

        # Convert targets: RA=1 -> 1.0, non-RA=0 -> -1.0
        targets = np.where(y_is_ra == 1, 1.0, -1.0)

        # Autograd optimizer
        opt = qml.AdamOptimizer(stepsize=lr)
        weights = pnp.array(self.weights, requires_grad=True)
        bias = float(self.bias)

        # Mini-batch or subset for fast NISQ simulation
        n_samples = min(len(angles), 300)
        idx = np.random.choice(len(angles), n_samples, replace=False)
        sub_angles = angles[idx]
        sub_targets = targets[idx]

        def cost_fn(w):
            loss = 0.0
            for x_i, y_i in zip(sub_angles, sub_targets):
                pred = self.circuit_qnode(w, x_i) + bias
                loss += (pred - y_i) ** 2
            return loss / len(sub_angles)

        w = weights
        for epoch in range(epochs):
            w, loss_val = opt.step_and_cost(cost_fn, w)

        self.weights = np.array(w)
        self.is_trained = True

        # Evaluate on subset
        preds = []
        for x_i in sub_angles:
            expval = float(self.circuit_qnode(self.weights, x_i)) + bias
            preds.append(1 if expval >= 0 else 0)

        eval_acc = float(np.mean(np.array(preds) == (sub_targets > 0).astype(int)))

        return {
            "qubit_count": self.n_qubits,
            "layers": self.n_layers,
            "epochs_run": epochs,
            "accuracy": round(eval_acc, 4),
            "explained_variance_ratio": [round(float(v), 4) for v in self.pca.explained_variance_ratio_]
        }

    def predict_single(self, X_1sample: np.ndarray) -> float:
        """Evaluate single sample and return calibrated RA risk probability in [0, 1]."""
        if not self.is_trained:
            raise RuntimeError("QML model is not trained.")
        angles = self.transform_to_angles(X_1sample)[0]
        expval = float(self.circuit_qnode(self.weights, angles)) + self.bias
        # Map expectation in [-1, 1] to probability in [0, 1] via sigmoid
        prob = 1.0 / (1.0 + np.exp(-2.5 * expval))
        return float(np.clip(prob, 0.01, 0.99))

    def save(self, filepath: str):
        data = {
            "weights": self.weights.tolist() if self.weights is not None else None,
            "bias": float(self.bias),
            "scale": float(self.scale),
            "n_qubits": self.n_qubits,
            "n_layers": self.n_layers,
            "is_trained": bool(self.is_trained)
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        # Save preprocessors
        prep_path = filepath.replace(".json", "_prep.joblib")
        joblib.dump({
            "scaler": self.scaler,
            "pca": self.pca,
            "angle_scaler": self.angle_scaler
        }, prep_path)

    @classmethod
    def load(cls, filepath: str):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        qml_model = cls(n_qubits=data["n_qubits"], n_layers=data["n_layers"])
        qml_model.weights = np.array(data["weights"])
        qml_model.bias = data["bias"]
        qml_model.scale = data["scale"]
        qml_model.is_trained = data["is_trained"]

        prep_path = filepath.replace(".json", "_prep.joblib")
        if os.path.exists(prep_path):
            prep_data = joblib.load(prep_path)
            qml_model.scaler = prep_data["scaler"]
            qml_model.pca = prep_data["pca"]
            qml_model.angle_scaler = prep_data["angle_scaler"]

        return qml_model
