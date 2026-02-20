import sys
import json
import os
import pandas as pd
import joblib
import re
import xgboost as xgb # Ensure XGBoost is available for unpickling

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "data", "career")

MODEL_PATH = os.path.join(MODELS_DIR, "career_model.pkl")
FEATURES_PATH = os.path.join(MODELS_DIR, "feature_columns.json")
ENCODER_PATH = os.path.join(MODELS_DIR, "role_encoder.pkl")
SKILL_MAP_PATH = os.path.join(MODELS_DIR, "role_skill_map.json")

def load_artifacts():
    try:
        # Using joblib for better compatibility with XGBoost/Sklearn models
        model = joblib.load(MODEL_PATH)
        role_encoder = joblib.load(ENCODER_PATH)
        
        with open(FEATURES_PATH, "r") as f:
            feature_columns = json.load(f)
            
        with open(SKILL_MAP_PATH, "r") as f:
            role_skill_map = json.load(f)
            
        return model, feature_columns, role_encoder, role_skill_map
    except Exception as e:
        print(json.dumps({"error": f"Failed to load ML artifacts: {str(e)}"}))
        sys.exit(1)

def predict_career(skills, model, feature_columns, role_encoder):
    # Standardize input skills
    normalized_input = [s.lower().strip() for s in skills]
    
    # Build feature vector
    input_data = {col: 0 for col in feature_columns}
    for skill in normalized_input:
        if skill in input_data:
            input_data[skill] = 1
            
    input_df = pd.DataFrame([input_data])
    
    # Predict probabilities
    probs = model.predict_proba(input_df)[0]
    
    # Get top 3 roles
    top_indices = probs.argsort()[-3:][::-1]
    results = []
    
    for idx in top_indices:
        role = role_encoder.inverse_transform([idx])[0]
        confidence = float(probs[idx]) * 100 # Cast to standard float
        confidence = round(confidence, 2)
        results.append({
            "role": role,
            "confidence": confidence
        })
    
    return results

def analyze_gap(skills, predicted_role, role_skill_map):
    # Standardize
    user_skills = set([s.lower().strip() for s in skills])
    role_key = predicted_role.lower().strip()
    
    # Get required skills from map
    required_skills = role_skill_map.get(role_key, [])
    
    if not required_skills:
        # Search for partial match in keys if exact match fails
        for key in role_skill_map.keys():
            if key in role_key or role_key in key:
                required_skills = role_skill_map[key]
                break
    
    if not required_skills:
        return {
            "matchedSkills": [],
            "missingSkills": [],
            "matchPercentage": 0
        }
        
    matched = [s for s in required_skills if s.lower() in user_skills]
    missing = [s for s in required_skills if s.lower() not in user_skills]
    
    match_percent = round((len(matched) / len(required_skills)) * 100) if required_skills else 0
    
    return {
        "matchedSkills": matched,
        "missingSkills": missing,
        "matchPercentage": match_percent
    }

def main():
    # Load everything
    model, features, encoder, skill_map = load_artifacts()
    
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            return
            
        params = json.loads(input_data)
        skills = params.get("skills", [])
        
        if not skills:
            print(json.dumps({"error": "No skills provided"}))
            return
            
        # 1. Predict Role
        predictions = predict_career(skills, model, features, encoder)
        best_role = predictions[0]["role"]
        
        # 2. Analyze Gap for the top predicted role
        gap = analyze_gap(skills, best_role, skill_map)
        
        # 3. Formulate Final Response
        response = {
            "suggestedRoles": predictions,
            "skillGap": {
                "role": best_role,
                **gap
            }
        }
        
        print(json.dumps(response))
        
    except Exception as e:
        print(json.dumps({"error": f"ML runtime error: {str(e)}"}))

if __name__ == "__main__":
    main()
