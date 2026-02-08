import pandas as pd
import pickle

# 1️⃣ Load trained files
model = pickle.load(open("career_model.pkl", "rb"))
feature_columns = pickle.load(open("feature_columns.pkl", "rb"))
role_encoder = pickle.load(open("role_encoder.pkl", "rb"))

# 2️⃣ Example input skills (ONLY skill names)
resume_skills = [
    "python",
    "sql",
    "javascript",
    "react",
    "node",
    "dsa",
    "os"
]

# 3️⃣ Build FULL feature vector (76 features!)
input_data = {col: 0 for col in feature_columns}

for skill in resume_skills:
    if skill in input_data:
        input_data[skill] = 1

input_df = pd.DataFrame([input_data])

# 4️⃣ Predict
predicted_label = model.predict(input_df)[0]
probabilities = model.predict_proba(input_df)[0]

predicted_role = role_encoder.inverse_transform([predicted_label])[0]
confidence = round(max(probabilities) * 100, 2)

print({
    "predictedRole": predicted_role,
    "confidence": confidence
})
