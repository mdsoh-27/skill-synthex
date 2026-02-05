import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import pickle

# 1️⃣ Load dataset
data = pd.read_csv("career_dataset.csv")

# drop missing roles
data = data.dropna(subset=["role"])

# 2️⃣ Convert role → binary label
tech_roles = [
    "Software Engineer", "Web Developer", "Data Scientist",
    "ML Engineer", "AI Engineer", "Backend Developer",
    "Frontend Developer"
]

data["label"] = data["role"].apply(
    lambda x: 1 if x in tech_roles else 0
)

# 3️⃣ Convert features to numeric
for col in data.columns:
    if col not in ["role", "label"]:
        data[col] = pd.to_numeric(data[col], errors="coerce").fillna(0)

# 4️⃣ Split
X = data.drop(["role", "label"], axis=1)
y = data["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 5️⃣ Train
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# 6️⃣ Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("✅ Model trained successfully")
print("🎯 Accuracy:", accuracy)

# 7️⃣ Save
with open("career_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("💾 Model saved")
