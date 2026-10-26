"""
Comprehensive Autoimmune & Rheumatic Disease Dataset Generator
Generates: Rheumatic_and_Autoimmune_Disease_Dataset.xlsx
Benchmark based on ACR/EULAR, SLICC, and ASAS classification criteria.
"""

import os
import numpy as np
import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_EXCEL = DATA_DIR / "Rheumatic_and_Autoimmune_Disease_Dataset.xlsx"
OUTPUT_CSV = DATA_DIR / "Rheumatic_and_Autoimmune_Disease_Dataset.csv"


def generate_dataset(n_samples_per_class: int = 200, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    records = []

    # 1. Rheumatoid Arthritis (RA)
    # Hallmarks: High RF (>14, often >50), High Anti-CCP (>20, often >100), Elevated ESR (>20), High CRP (>5),
    # Prolonged morning stiffness (>45m), symmetrical small joint polyarthritis, 3:1 female ratio.
    for i in range(n_samples_per_class):
        age = int(np.clip(np.random.normal(54, 11), 22, 82))
        gender = np.random.choice(["Female", "Male"], p=[0.75, 0.25])
        rf = float(np.clip(np.random.exponential(65) + 25, 12, 600))
        anti_ccp = float(np.clip(np.random.exponential(120) + 35, 15, 800))
        esr = float(np.clip(np.random.normal(42, 16), 15, 120))
        crp = float(np.clip(np.random.normal(16, 8), 4.5, 65))
        ana_status = np.random.choice(["Positive", "Negative"], p=[0.35, 0.65])
        ana_titer = np.random.choice(["1:80", "1:160", "<1:40"], p=[0.25, 0.10, 0.65])
        c3 = float(np.clip(np.random.normal(125, 18), 90, 175))
        c4 = float(np.clip(np.random.normal(24, 6), 12, 38))
        morning_stiffness = float(np.clip(np.random.normal(75, 25), 35, 180))
        tender_joints = int(np.clip(np.random.poisson(8) + 2, 2, 24))
        swollen_joints = int(np.clip(np.random.poisson(6) + 1, 1, 20))
        symmetrical = "Yes" if np.random.rand() < 0.90 else "No"
        hla_b27 = "Negative"

        records.append({
            "age": age, "gender": gender, "rf_iu_ml": round(rf, 1),
            "anti_ccp_u_ml": round(anti_ccp, 1), "esr_mm_hr": round(esr, 1),
            "crp_mg_l": round(crp, 1), "ana_status": ana_status, "ana_titer": ana_titer,
            "c3_mg_dl": round(c3, 1), "c4_mg_dl": round(c4, 1),
            "morning_stiffness_min": round(morning_stiffness, 0),
            "tender_joint_count": tender_joints, "swollen_joint_count": swollen_joints,
            "symmetrical_joints": symmetrical, "hla_b27": hla_b27,
            "diagnosis": "Rheumatoid Arthritis (RA)",
            "is_ra": 1
        })

    # 2. Ankylosing Spondylitis (AS)
    # Hallmarks: Male predominance (2-3:1), younger onset (20-40), HLA-B27 positive (85-95%),
    # RF negative, Anti-CCP negative, elevated ESR and CRP, axial/spine stiffness.
    for i in range(n_samples_per_class):
        age = int(np.clip(np.random.normal(32, 7), 19, 58))
        gender = np.random.choice(["Male", "Female"], p=[0.70, 0.30])
        rf = float(np.clip(np.random.normal(6.5, 3), 1, 13.9))
        anti_ccp = float(np.clip(np.random.normal(7, 4), 1, 19.5))
        esr = float(np.clip(np.random.normal(34, 14), 12, 85))
        crp = float(np.clip(np.random.normal(14, 7), 3, 50))
        ana_status = "Negative"
        ana_titer = "<1:40"
        c3 = float(np.clip(np.random.normal(130, 15), 95, 170))
        c4 = float(np.clip(np.random.normal(26, 5), 14, 38))
        morning_stiffness = float(np.clip(np.random.normal(60, 20), 30, 120))
        tender_joints = int(np.clip(np.random.poisson(2), 0, 6))
        swollen_joints = int(np.clip(np.random.poisson(1), 0, 4))
        symmetrical = "No"
        hla_b27 = np.random.choice(["Positive", "Negative"], p=[0.90, 0.10])

        records.append({
            "age": age, "gender": gender, "rf_iu_ml": round(rf, 1),
            "anti_ccp_u_ml": round(anti_ccp, 1), "esr_mm_hr": round(esr, 1),
            "crp_mg_l": round(crp, 1), "ana_status": ana_status, "ana_titer": ana_titer,
            "c3_mg_dl": round(c3, 1), "c4_mg_dl": round(c4, 1),
            "morning_stiffness_min": round(morning_stiffness, 0),
            "tender_joint_count": tender_joints, "swollen_joint_count": swollen_joints,
            "symmetrical_joints": symmetrical, "hla_b27": hla_b27,
            "diagnosis": "Ankylosing Spondylitis",
            "is_ra": 0
        })

    # 3. Systemic Lupus Erythematosus (SLE)
    # Hallmarks: High female predominance (9:1), ANA strongly positive (98%), Low complement C3 (<90) and C4 (<10),
    # RF can be mildly positive, Anti-CCP usually negative, high ESR with normal/mild CRP (unless serositis/infection).
    for i in range(n_samples_per_class):
        age = int(np.clip(np.random.normal(36, 10), 18, 65))
        gender = np.random.choice(["Female", "Male"], p=[0.90, 0.10])
        rf = float(np.clip(np.random.normal(18, 12), 2, 70)) # mildly elevated in ~20%
        anti_ccp = float(np.clip(np.random.normal(8, 5), 1, 24))
        esr = float(np.clip(np.random.normal(48, 18), 22, 110))
        crp = float(np.clip(np.random.normal(4.2, 2.5), 1.0, 18)) # discordance ESR vs CRP
        ana_status = "Positive"
        ana_titer = np.random.choice(["1:320", "1:640", "1:1280"], p=[0.4, 0.4, 0.2])
        c3 = float(np.clip(np.random.normal(68, 12), 35, 88)) # Low C3
        c4 = float(np.clip(np.random.normal(7.5, 2.2), 2, 9.8)) # Low C4
        morning_stiffness = float(np.clip(np.random.normal(40, 18), 15, 90))
        tender_joints = int(np.clip(np.random.poisson(4), 1, 10))
        swollen_joints = int(np.clip(np.random.poisson(2), 0, 8))
        symmetrical = "Yes" if np.random.rand() < 0.65 else "No"
        hla_b27 = "Negative"

        records.append({
            "age": age, "gender": gender, "rf_iu_ml": round(rf, 1),
            "anti_ccp_u_ml": round(anti_ccp, 1), "esr_mm_hr": round(esr, 1),
            "crp_mg_l": round(crp, 1), "ana_status": ana_status, "ana_titer": ana_titer,
            "c3_mg_dl": round(c3, 1), "c4_mg_dl": round(c4, 1),
            "morning_stiffness_min": round(morning_stiffness, 0),
            "tender_joint_count": tender_joints, "swollen_joint_count": swollen_joints,
            "symmetrical_joints": symmetrical, "hla_b27": hla_b27,
            "diagnosis": "Systemic Lupus Erythematosus",
            "is_ra": 0
        })

    # 4. Sjögren's Syndrome
    # Hallmarks: Female predominance (9:1), Age 45-65, High ANA (70-80%), Positive RF (50-60%),
    # Anti-CCP usually negative, Elevated ESR, Normal/mild CRP, sicca symptoms.
    for i in range(n_samples_per_class):
        age = int(np.clip(np.random.normal(52, 9), 30, 75))
        gender = np.random.choice(["Female", "Male"], p=[0.90, 0.10])
        rf = float(np.clip(np.random.normal(38, 22), 8, 120)) # often positive in Sjögren's!
        anti_ccp = float(np.clip(np.random.normal(9, 4), 2, 22)) # usually negative
        esr = float(np.clip(np.random.normal(38, 14), 18, 90))
        crp = float(np.clip(np.random.normal(4.8, 3.0), 1.2, 16))
        ana_status = np.random.choice(["Positive", "Negative"], p=[0.80, 0.20])
        ana_titer = np.random.choice(["1:160", "1:320", "<1:40"], p=[0.5, 0.3, 0.2])
        c3 = float(np.clip(np.random.normal(118, 16), 88, 160))
        c4 = float(np.clip(np.random.normal(21, 5), 11, 35))
        morning_stiffness = float(np.clip(np.random.normal(30, 15), 10, 60))
        tender_joints = int(np.clip(np.random.poisson(3), 0, 8))
        swollen_joints = int(np.clip(np.random.poisson(1), 0, 5))
        symmetrical = "Yes" if np.random.rand() < 0.50 else "No"
        hla_b27 = "Negative"

        records.append({
            "age": age, "gender": gender, "rf_iu_ml": round(rf, 1),
            "anti_ccp_u_ml": round(anti_ccp, 1), "esr_mm_hr": round(esr, 1),
            "crp_mg_l": round(crp, 1), "ana_status": ana_status, "ana_titer": ana_titer,
            "c3_mg_dl": round(c3, 1), "c4_mg_dl": round(c4, 1),
            "morning_stiffness_min": round(morning_stiffness, 0),
            "tender_joint_count": tender_joints, "swollen_joint_count": swollen_joints,
            "symmetrical_joints": symmetrical, "hla_b27": hla_b27,
            "diagnosis": "Sjögren's Syndrome",
            "is_ra": 0
        })

    # 5. Psoriatic Arthritis (PsA)
    # Hallmarks: Equal sex ratio, RF negative (seronegative), Anti-CCP negative,
    # High ESR and CRP, asymmetrical peripheral oligoarthritis, dactylitis, DIP involvement.
    for i in range(n_samples_per_class):
        age = int(np.clip(np.random.normal(48, 12), 24, 76))
        gender = np.random.choice(["Female", "Male"], p=[0.50, 0.50])
        rf = float(np.clip(np.random.normal(7, 3), 1, 13.8))
        anti_ccp = float(np.clip(np.random.normal(8, 4), 1, 19.0))
        esr = float(np.clip(np.random.normal(32, 12), 14, 75))
        crp = float(np.clip(np.random.normal(12, 6), 4, 40))
        ana_status = np.random.choice(["Negative", "Positive"], p=[0.85, 0.15])
        ana_titer = "<1:40"
        c3 = float(np.clip(np.random.normal(128, 15), 95, 168))
        c4 = float(np.clip(np.random.normal(25, 5), 14, 38))
        morning_stiffness = float(np.clip(np.random.normal(45, 18), 20, 90))
        tender_joints = int(np.clip(np.random.poisson(4), 1, 12))
        swollen_joints = int(np.clip(np.random.poisson(3), 1, 10))
        symmetrical = "No" # typically asymmetrical
        hla_b27 = np.random.choice(["Positive", "Negative"], p=[0.25, 0.75])

        records.append({
            "age": age, "gender": gender, "rf_iu_ml": round(rf, 1),
            "anti_ccp_u_ml": round(anti_ccp, 1), "esr_mm_hr": round(esr, 1),
            "crp_mg_l": round(crp, 1), "ana_status": ana_status, "ana_titer": ana_titer,
            "c3_mg_dl": round(c3, 1), "c4_mg_dl": round(c4, 1),
            "morning_stiffness_min": round(morning_stiffness, 0),
            "tender_joint_count": tender_joints, "swollen_joint_count": swollen_joints,
            "symmetrical_joints": symmetrical, "hla_b27": hla_b27,
            "diagnosis": "Psoriatic Arthritis",
            "is_ra": 0
        })

    # 6. Reactive Arthritis
    # Hallmarks: Younger adults (20-40), post-infectious, asymmetrical oligoarthritis (knees, ankles),
    # RF negative, Anti-CCP negative, markedly elevated ESR and CRP, HLA-B27 positive (50-70%).
    for i in range(n_samples_per_class):
        age = int(np.clip(np.random.normal(29, 6), 18, 50))
        gender = np.random.choice(["Male", "Female"], p=[0.65, 0.35])
        rf = float(np.clip(np.random.normal(6, 2.5), 1, 13.5))
        anti_ccp = float(np.clip(np.random.normal(6, 2.5), 1, 18.0))
        esr = float(np.clip(np.random.normal(45, 16), 20, 105))
        crp = float(np.clip(np.random.normal(22, 10), 8, 75)) # Acute phase marked
        ana_status = "Negative"
        ana_titer = "<1:40"
        c3 = float(np.clip(np.random.normal(132, 16), 95, 175))
        c4 = float(np.clip(np.random.normal(26, 5), 14, 40))
        morning_stiffness = float(np.clip(np.random.normal(35, 15), 15, 75))
        tender_joints = int(np.clip(np.random.poisson(2) + 1, 1, 6))
        swollen_joints = int(np.clip(np.random.poisson(2) + 1, 1, 5))
        symmetrical = "No"
        hla_b27 = np.random.choice(["Positive", "Negative"], p=[0.65, 0.35])

        records.append({
            "age": age, "gender": gender, "rf_iu_ml": round(rf, 1),
            "anti_ccp_u_ml": round(anti_ccp, 1), "esr_mm_hr": round(esr, 1),
            "crp_mg_l": round(crp, 1), "ana_status": ana_status, "ana_titer": ana_titer,
            "c3_mg_dl": round(c3, 1), "c4_mg_dl": round(c4, 1),
            "morning_stiffness_min": round(morning_stiffness, 0),
            "tender_joint_count": tender_joints, "swollen_joint_count": swollen_joints,
            "symmetrical_joints": symmetrical, "hla_b27": hla_b27,
            "diagnosis": "Reactive Arthritis",
            "is_ra": 0
        })

    # 7. Normal / Healthy
    # Hallmarks: RF < 14, Anti-CCP < 20, ESR normal (<20), CRP normal (<5.0),
    # ANA negative, C3/C4 normal, minimal stiffness (<15m), 0 tender/swollen joints.
    for i in range(n_samples_per_class):
        age = int(np.clip(np.random.normal(42, 14), 18, 80))
        gender = np.random.choice(["Female", "Male"], p=[0.55, 0.45])
        rf = float(np.clip(np.random.normal(6.0, 2.5), 1.0, 13.5))
        anti_ccp = float(np.clip(np.random.normal(7.0, 3.5), 1.0, 18.5))
        esr = float(np.clip(np.random.normal(10.5, 4.0), 2.0, 19.5))
        crp = float(np.clip(np.random.normal(1.8, 0.9), 0.2, 4.8))
        ana_status = "Negative"
        ana_titer = "<1:40"
        c3 = float(np.clip(np.random.normal(128, 16), 92, 172))
        c4 = float(np.clip(np.random.normal(25, 5), 12, 38))
        morning_stiffness = float(np.clip(np.random.normal(5, 4), 0, 15))
        tender_joints = 0
        swollen_joints = 0
        symmetrical = "No"
        hla_b27 = "Negative"

        records.append({
            "age": age, "gender": gender, "rf_iu_ml": round(rf, 1),
            "anti_ccp_u_ml": round(anti_ccp, 1), "esr_mm_hr": round(esr, 1),
            "crp_mg_l": round(crp, 1), "ana_status": ana_status, "ana_titer": ana_titer,
            "c3_mg_dl": round(c3, 1), "c4_mg_dl": round(c4, 1),
            "morning_stiffness_min": round(morning_stiffness, 0),
            "tender_joint_count": tender_joints, "swollen_joint_count": swollen_joints,
            "symmetrical_joints": symmetrical, "hla_b27": hla_b27,
            "diagnosis": "Normal",
            "is_ra": 0
        })

    df = pd.DataFrame(records)
    # Shuffle
    df = df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    df.insert(0, "patient_id", [f"P{10001 + idx}" for idx in range(len(df))])

    # Save Excel and CSV
    df.to_excel(OUTPUT_EXCEL, index=False, engine="openpyxl")
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"Dataset generated successfully: {len(df)} samples saved to {OUTPUT_EXCEL}")
    return df


if __name__ == "__main__":
    generate_dataset()
