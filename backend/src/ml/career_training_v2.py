import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import joblib
import os

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder

from xgboost import XGBClassifier

# =====================================
# 1️⃣ CONFIGURATION & PATHS
# =====================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data", "career")
DATASET_PATH = os.path.join(DATA_DIR, "structured_skill_dataset.csv")

# Ensure output directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# =====================================
# 1️⃣ LOAD DATA
# =====================================
print(f"Loading dataset from: {DATASET_PATH}")
df = pd.read_csv(DATASET_PATH)
print("Original Shape:", df.shape)

# =====================================
# 2️⃣ CLEAN ROLE NAMES
# =====================================
df["role"] = df["role"].str.lower().str.strip()

df["role"] = df["role"].replace({
    "senior data scientist": "data scientist",
    "sr. data scientist": "data scientist",
    "principal data scientist": "data scientist",
    "machine learning engineer": "ml engineer",
    "senior machine learning engineer": "ml engineer",
    "ai/ml engineer": "ml engineer"
})

print("\nRole Distribution Before Filtering:")
print(df["role"].value_counts())

# =====================================
# 3️⃣ REMOVE RARE ROLES
# =====================================
role_counts = df["role"].value_counts()
valid_roles = role_counts[role_counts >= 5].index
df = df[df["role"].isin(valid_roles)]

print("\nRole Distribution After Filtering:")
print(df["role"].value_counts())
print("Shape After Role Filtering:", df.shape)

# =====================================
# 4️⃣ SPLIT FEATURES & TARGET
# =====================================
X = df.drop("role", axis=1)
y = df["role"]

# =====================================
# 5️⃣ REMOVE WEAK & OVERCOMMON SKILLS
# =====================================
min_occurrence = 10
max_occurrence = 0.8 * len(X)

# Safety check for empty dataframe after filtering if dataset is small
binary_X = X.apply(pd.to_numeric, errors='coerce').fillna(0).astype(int)
skill_sums = binary_X.sum()
selected_features = skill_sums[(skill_sums >= min_occurrence) & (skill_sums <= max_occurrence)].index

if len(selected_features) > 0:
    X = binary_X[selected_features]
    print("Shape After Feature Selection:", X.shape)
else:
    X = binary_X
    print("Feature selection resulted in 0 features, keeping all binary features.")

# Keep filtered dataframe for skill mapping later
df_filtered = pd.concat([X, y], axis=1)

# =====================================
# 6️⃣ ENCODE LABELS
# =====================================
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# =====================================
# 7️⃣ TRAIN TEST SPLIT
# =====================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# =====================================
# 8️⃣ DEFINE MODELS
# =====================================
models = {
    "Random Forest": RandomForestClassifier(
        n_estimators=500,
        max_depth=20,
        min_samples_split=5,
        class_weight="balanced",
        random_state=42
    ),
    "Logistic Regression": LogisticRegression(
        max_iter=1000,
        class_weight="balanced"
    ),
    "SVM": SVC(
        class_weight="balanced",
        probability=True
    ),
    "XGBoost": XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        eval_metric="mlogloss"
    )
}

results = {}

# =====================================
# 9️⃣ TRAIN & EVALUATE
# =====================================
for name, model in models.items():
    print(f"\nTraining {name}...")
    
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    results[name] = {
        "Accuracy": acc,
        "Precision": prec,
        "Recall": rec,
        "F1 Score": f1
    }

    print(f"{name} Results:")
    print("Accuracy :", acc)
    print("Precision:", prec)
    print("Recall   :", rec)
    print("F1 Score :", f1)

# =====================================
# 🔟 RESULTS TABLE & SAVING METRICS
# =====================================
results_df = pd.DataFrame(results).T

print("\n==============================")
print("MODEL COMPARISON")
print("==============================")
print(results_df)

# Save results to JSON for API display
with open(os.path.join(DATA_DIR, "model_metrics.json"), "w") as f:
    json.dump(results, f, indent=4)

# =====================================
# 1️⃣1️⃣ SELECT BEST MODEL
# =====================================
best_model_name = results_df["Accuracy"].idxmax()
best_model = models[best_model_name]

print("\nBEST MODEL SELECTED:")
print("Model:", best_model_name)
print(results_df.loc[best_model_name])

# =====================================
# 1️⃣2️⃣ CONFUSION MATRIX
# =====================================
y_pred_best = best_model.predict(X_test)
cm = confusion_matrix(y_test, y_pred_best)

# Save confusion matrix plot
plt.figure(figsize=(10,8))
sns.heatmap(cm, annot=True, fmt="d", xticklabels=label_encoder.classes_, yticklabels=label_encoder.classes_)
plt.title(f"Confusion Matrix - {best_model_name}")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.tight_layout()
plt.savefig(os.path.join(DATA_DIR, "confusion_matrix.png"))
plt.close()

# =====================================
# 1️⃣3️⃣ METRIC COMPARISON GRAPH
# =====================================
results_df.plot(kind="bar", figsize=(10,6))
plt.title("Model Comparison")
plt.ylabel("Score")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig(os.path.join(DATA_DIR, "model_comparison.png"))
plt.close()

# =====================================
# 1️⃣4️⃣ CROSS VALIDATION
# =====================================
print("\nPerforming Cross Validation...")
cv_scores = cross_val_score(best_model, X, y_encoded, cv=5)
print("Cross Validation Accuracy Mean:", cv_scores.mean())

# =====================================
# 1️⃣5️⃣ SAVE MODEL, ENCODER & FEATURES
# =====================================
joblib.dump(best_model, os.path.join(DATA_DIR, "career_model.pkl"))
joblib.dump(label_encoder, os.path.join(DATA_DIR, "role_encoder.pkl"))
# Also save feature names as predict_role script expects it
with open(os.path.join(DATA_DIR, "feature_columns.json"), "w") as f:
    json.dump(X.columns.tolist(), f)
# For compatibility with existing pickle-based system:
import pickle
pickle.dump(best_model, open(os.path.join(DATA_DIR, "career_model_legacy.pkl"), "wb"))
pickle.dump(X.columns.tolist(), open(os.path.join(DATA_DIR, "feature_columns.pkl"), "wb"))
pickle.dump(label_encoder, open(os.path.join(DATA_DIR, "role_encoder_legacy.pkl"), "wb"))

# =====================================
# 1️⃣6️⃣ CREATE ROLE → SKILL MAP
# =====================================
role_skill_map = {}

for role in df_filtered["role"].unique():
    role_df = df_filtered[df_filtered["role"] == role]
    # Handle non-numeric if any
    numeric_role_df = role_df.drop("role", axis=1).apply(pd.to_numeric, errors='coerce').fillna(0)
    skill_means = numeric_role_df.mean()

    required_skills = skill_means[skill_means >= 0.3].index.tolist()
    role_skill_map[role] = required_skills

with open(os.path.join(DATA_DIR, "role_skill_map.json"), "w") as f:
    json.dump(role_skill_map, f, indent=4)

print("\nNew Model + Encoder + Role Skill Map Saved Successfully in " + DATA_DIR)
