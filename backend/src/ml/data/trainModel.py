import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

# 1️⃣ Load dataset
data = pd.read_csv("career_dataset.csv")

# Remove rows without role
data = data.dropna(subset=["role"])

# 2️⃣ Encode role labels
role_encoder = LabelEncoder()
data["role_encoded"] = role_encoder.fit_transform(data["role"])

# 3️⃣ Convert all skill columns to numeric
for col in data.columns:
    if col not in ["role", "role_encoded"]:
        data[col] = pd.to_numeric(data[col], errors="coerce").fillna(0).astype(int)

# 4️⃣ Split features & target
X = data.drop(["role", "role_encoded"], axis=1)
y = data["role_encoded"]

# Save feature names
feature_columns = X.columns.tolist()

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 5️⃣ Train model
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    class_weight="balanced",
    random_state=42
)

model.fit(X_train, y_train)

# 6️⃣ Evaluate
accuracy = accuracy_score(y_test, model.predict(X_test))
print("✅ Model trained")
print("🎯 Accuracy:", accuracy)

# 7️⃣ Save EVERYTHING needed for prediction
pickle.dump(model, open("career_model.pkl", "wb"))
pickle.dump(feature_columns, open("feature_columns.pkl", "wb"))
pickle.dump(role_encoder, open("role_encoder.pkl", "wb"))

print("💾 Saved model, feature columns, and encoder")
