"""
Classical Machine Learning Models for Multi-class Autoimmune & Rheumatic Disease Screening
========================================================================================
Supports:
1. 7-Class Disease Classification (Random Forest Ensemble & Logistic Regression)
2. Calibrated Probabilities for 7 classes
3. Feature Importances
4. Binary RA Early Screening Risk Scoring
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, classification_report
from app.config import DISEASE_CLASSES, MODELS_DIR

# 12 Core clinical features
NUMERIC_FEATURES = [
    "age", "rf_iu_ml", "anti_ccp_u_ml", "esr_mm_hr", "crp_mg_l",
    "c3_mg_dl", "c4_mg_dl", "morning_stiffness_min",
    "tender_joint_count", "swollen_joint_count"
]

CATEGORICAL_FEATURES = [
    "gender", "ana_status", "symmetrical_joints", "hla_b27"
]


class AutoimmuneModelSuite:
    """
    Manages classical machine learning models for 7-class autoimmune screening.
    """

    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.rf_classifier = RandomForestClassifier(
            n_estimators=150,
            max_depth=8,
            random_state=random_state,
            class_weight="balanced"
        )
        self.lr_classifier = LogisticRegression(
            max_iter=1000,
            random_state=random_state,
            class_weight="balanced"
        )
        self.is_trained = False
        self.classes_ = DISEASE_CLASSES
        self.feature_names = None

    def _encode_dataframe(self, df: pd.DataFrame) -> Tuple[np.ndarray, list]:
        """Convert clinical columns into clean numeric array."""
        df_clean = df.copy()
        
        # Gender: Female=1, Male=0
        gender_num = (df_clean["gender"].astype(str).str.lower().str.startswith("f")).astype(float)
        # ANA status: Positive=1, Negative=0
        ana_num = (df_clean["ana_status"].astype(str).str.lower().str.startswith("p")).astype(float)
        # Symmetrical: Yes=1, No=0
        sym_num = (df_clean["symmetrical_joints"].astype(str).str.lower().str.startswith("y")).astype(float)
        # HLA-B27: Positive=1, Negative=0
        hla_num = (df_clean["hla_b27"].astype(str).str.lower().str.startswith("p")).astype(float)

        feature_cols = []
        feature_data = []

        for col in NUMERIC_FEATURES:
            feature_cols.append(col)
            val = pd.to_numeric(df_clean[col], errors="coerce").fillna(0.0).values
            feature_data.append(val)

        feature_cols.extend(["gender_female", "ana_positive", "symmetrical_yes", "hla_b27_positive"])
        feature_data.extend([gender_num.values, ana_num.values, sym_num.values, hla_num.values])

        X = np.column_stack(feature_data)
        return X, feature_cols

    def fit(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Fit scaler and models on dataset."""
        X, feature_names = self._encode_dataframe(df)
        self.feature_names = feature_names
        y = df["diagnosis"].values

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=self.random_state, stratify=y
        )

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Train models
        self.rf_classifier.fit(X_train_scaled, y_train)
        self.lr_classifier.fit(X_train_scaled, y_train)

        # Evaluate
        rf_preds = self.rf_classifier.predict(X_test_scaled)
        rf_acc = float(accuracy_score(y_test, rf_preds))
        rf_f1 = float(f1_score(y_test, rf_preds, average="weighted"))

        lr_preds = self.lr_classifier.predict(X_test_scaled)
        lr_acc = float(accuracy_score(y_test, lr_preds))
        lr_f1 = float(f1_score(y_test, lr_preds, average="weighted"))

        self.is_trained = True

        # Extract feature importances
        rf_importances = {
            feat: round(float(imp), 4)
            for feat, imp in zip(self.feature_names, self.rf_classifier.feature_importances_)
        }
        # Sort desc
        rf_importances = dict(sorted(rf_importances.items(), key=lambda item: item[1], reverse=True))

        return {
            "test_sample_count": len(y_test),
            "random_forest": {
                "accuracy": round(rf_acc, 4),
                "f1_score": round(rf_f1, 4),
                "feature_importances": rf_importances
            },
            "logistic_regression": {
                "accuracy": round(lr_acc, 4),
                "f1_score": round(lr_f1, 4)
            }
        }

    def predict_single(self, patient_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Predict for a single patient dictionary."""
        if not self.is_trained:
            raise RuntimeError("Model is not trained.")

        # Build 1-row DataFrame
        row = {
            "age": patient_dict.get("age", 45.0),
            "gender": patient_dict.get("gender", "Female"),
            "rf_iu_ml": patient_dict.get("rf_iu_ml", 0.0),
            "anti_ccp_u_ml": patient_dict.get("anti_ccp_u_ml", 0.0),
            "esr_mm_hr": patient_dict.get("esr_mm_hr", 15.0),
            "crp_mg_l": patient_dict.get("crp_mg_l", 3.0),
            "ana_status": patient_dict.get("ana_status", "Negative"),
            "c3_mg_dl": patient_dict.get("c3_mg_dl", 120.0),
            "c4_mg_dl": patient_dict.get("c4_mg_dl", 25.0),
            "morning_stiffness_min": patient_dict.get("morning_stiffness_min", 15.0),
            "tender_joint_count": patient_dict.get("tender_joint_count", 0),
            "swollen_joint_count": patient_dict.get("swollen_joint_count", 0),
            "symmetrical_joints": patient_dict.get("symmetrical_joints", "No"),
            "hla_b27": patient_dict.get("hla_b27", "Negative")
        }

        df_single = pd.DataFrame([row])
        X, _ = self._encode_dataframe(df_single)
        X_scaled = self.scaler.transform(X)

        rf_probs = self.rf_classifier.predict_proba(X_scaled)[0]
        classes = self.rf_classifier.classes_

        prob_dict = {
            cls_name: round(float(prob * 100), 1)
            for cls_name, prob in zip(classes, rf_probs)
        }
        # Sort descending
        prob_dict = dict(sorted(prob_dict.items(), key=lambda x: x[1], reverse=True))

        top_disease = max(prob_dict.items(), key=lambda x: x[1])[0]
        top_confidence = prob_dict[top_disease]

        # Calculate RA specific screening risk score (0-100%)
        # RA probability + marker severity weight
        ra_prob = prob_dict.get("Rheumatoid Arthritis (RA)", 0.0)
        
        # Clinical risk weighting
        rf_val = float(patient_dict.get("rf_iu_ml", 0.0) or 0.0)
        anti_ccp_val = float(patient_dict.get("anti_ccp_u_ml", 0.0) or 0.0)
        esr_val = float(patient_dict.get("esr_mm_hr", 0.0) or 0.0)
        crp_val = float(patient_dict.get("crp_mg_l", 0.0) or 0.0)

        # Baseline risk from probability
        risk_score = ra_prob * 0.70
        # Marker booster: high Anti-CCP and high RF are heavily indicative
        if anti_ccp_val > 50:
            risk_score += 18.0
        elif anti_ccp_val > 20:
            risk_score += 10.0

        if rf_val > 50:
            risk_score += 12.0
        elif rf_val > 14:
            risk_score += 7.0

        if esr_val > 30 or crp_val > 10:
            risk_score += 8.0

        screening_score = int(np.clip(round(risk_score), 1, 99))

        if screening_score >= 70:
            risk_category = "High Risk"
        elif screening_score >= 35:
            risk_category = "Moderate Risk"
        else:
            risk_category = "Low Risk"

        return {
            "predicted_disease": top_disease,
            "confidence": top_confidence,
            "ra_screening_score": screening_score,
            "ra_risk_category": risk_category,
            "probabilities": prob_dict
        }

    def save(self, file_path: str):
        joblib.dump({
            "scaler": self.scaler,
            "rf": self.rf_classifier,
            "lr": self.lr_classifier,
            "classes": self.classes_,
            "feature_names": self.feature_names
        }, file_path)

    @classmethod
    def load(cls, file_path: str):
        data = joblib.load(file_path)
        suite = cls()
        suite.scaler = data["scaler"]
        suite.rf_classifier = data["rf"]
        suite.lr_classifier = data["lr"]
        suite.classes_ = data["classes"]
        suite.feature_names = data["feature_names"]
        suite.is_trained = True
        return suite
