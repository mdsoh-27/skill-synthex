import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report
import pickle

# 1️⃣ Load dataset
data = pd.read_csv("career_dataset.csv")

# drop missing roles
data = data.dropna(subset=["role"])

# 2️⃣ Convert role → binary label
tech_roles = [
    "Software Engineer", "Web Developer", "Data Scientist",
    "ML Engineer", "AI Engineer", "Backend Developer",
    "Frontend Developer", "Full Stack Developer"
]

data["label"] = data["role"].apply(
    lambda x: 1 if any(role.lower() in x.lower() for role in tech_roles) else 0
)

# 3️⃣ Convert features to numeric
for col in data.columns:
    if col not in ["role", "label"]:
        data[col] = pd.to_numeric(data[col], errors="coerce").fillna(0).astype(int)

# 4️⃣ Split
X = data.drop(["role", "label"], axis=1)
y = data["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 5️⃣ Hyperparameter Tuning for RandomForest
print("🔍 Searching for best parameters...")
param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [None, 10, 20, 30],
    'min_samples_split': [2, 5, 10],
    'class_weight': ['balanced', None]
}

rf = RandomForestClassifier(random_state=42)
grid_search = GridSearchCV(rf, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid_search.fit(X_train, y_train)

best_rf = grid_search.best_estimator_

# 6️⃣ Compare with Gradient Boosting
gb = GradientBoostingClassifier(random_state=42)
gb_scores = cross_val_score(gb, X_train, y_train, cv=5)
rf_scores = cross_val_score(best_rf, X_train, y_train, cv=5)

print(f"🌲 Random Forest CV Accuracy: {rf_scores.mean():.4f}")
print(f"🚀 Gradient Boosting CV Accuracy: {gb_scores.mean():.4f}")

# Choose the best one
if gb_scores.mean() > rf_scores.mean():
    print("✅ Selected Gradient Boosting")
    model = gb.fit(X_train, y_train)
else:
    print("✅ Selected Optimized Random Forest")
    model = best_rf

# 7️⃣ Evaluate on test set
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("\n📊 Final Evaluation on Test Set:")
print("🎯 Accuracy:", accuracy)
print("\n📝 Classification Report:")
print(classification_report(y_test, y_pred))

# 8️⃣ Save
with open("career_model.pkl", "wb") as f:
    pickle.dump(model, f)

print(f"💾 Best model saved to career_model.pkl (Best Params: {grid_search.best_params_ if model == best_rf else 'Default GB'})")
