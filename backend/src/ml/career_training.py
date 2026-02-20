import pandas as pd
import numpy as np
import pickle
import os
import json
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "career", "career_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "data", "career")

def train_and_evaluate():
    # 1. Load data
    if not os.path.exists(DATA_PATH):
        print(f"Error: Dataset not found at {DATA_PATH}")
        return

    df = pd.read_csv(DATA_PATH)
    df = df.dropna(subset=["role"])

    # 2. Preprocess
    # Encode roles
    role_encoder = LabelEncoder()
    df["role_encoded"] = role_encoder.fit_transform(df["role"])
    
    # Skills columns (X) and role (y)
    X = df.drop(["role", "role_encoded"], axis=1)
    y = df["role_encoded"]
    
    # Ensure all X are numeric
    for col in X.columns:
        X[col] = pd.to_numeric(X[col], errors="coerce").fillna(0).astype(int)

    feature_columns = X.columns.tolist()

    # 3. Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "SVM": SVC(probability=True, random_state=42),
        "Linear Regression": LinearRegression() # Note: Linear Regression is unusual for multiclass, will use as a classifier by rounding
    }

    results = {}
    best_accuracy = 0
    best_model = None
    best_model_name = ""

    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        
        # Predictions
        if name == "Linear Regression":
            y_pred_cont = model.predict(X_test)
            y_pred = np.clip(np.round(y_pred_cont), 0, len(role_encoder.classes_) - 1).astype(int)
        else:
            y_pred = model.predict(X_test)
        
        # Metrics
        acc = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        # AUC-ROC (requires probabilities)
        try:
            if name == "Linear Regression":
                auc_roc = "N/A"
            else:
                y_prob = model.predict_proba(X_test)
                auc_roc = roc_auc_score(y_test, y_prob, multi_class='ovr', average='weighted')
        except:
            auc_roc = "N/A"
            
        results[name] = {
            "Accuracy": acc,
            "Precision": precision,
            "Recall": recall,
            "F1 Score": f1,
            "AUC-ROC": auc_roc
        }
        
        if acc > best_accuracy:
            best_accuracy = acc
            best_model = model
            best_model_name = name

    # 4. Save best model and metadata
    print(f"\nBest Model: {best_model_name} with Accuracy: {best_accuracy:.4f}")
    
    # Save results to JSON for metrics display
    with open(os.path.join(MODELS_DIR, "model_metrics.json"), "w") as f:
        json.dump(results, f, indent=4)

    # Save best model, encoder and feature columns
    pickle.dump(best_model, open(os.path.join(MODELS_DIR, "career_model.pkl"), "wb"))
    pickle.dump(feature_columns, open(os.path.join(MODELS_DIR, "feature_columns.pkl"), "wb"))
    pickle.dump(role_encoder, open(os.path.join(MODELS_DIR, "role_encoder.pkl"), "wb"))

    print("\nTraining completed. Files saved:")
    print("- career_model.pkl (Best Model)")
    print("- feature_columns.pkl")
    print("- role_encoder.pkl")
    print("- model_metrics.json")
    
    # Print confusion matrix for the best model
    if best_model_name != "Linear Regression":
        cm = confusion_matrix(y_test, best_model.predict(X_test))
        print("\nConfusion Matrix (Best Model):")
        print(cm)

if __name__ == "__main__":
    train_and_evaluate()
