import sys
import json
import os
import pandas as pd
import re

# Load skill dictionary for normalization
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SKILLS_JSON_PATH = os.path.join(BASE_DIR, "..", "nlp", "skills.json")
DATASET_PATH = os.path.join(BASE_DIR, "data", "career_dataset.csv")

try:
    with open(SKILLS_JSON_PATH, "r") as f:
        skill_dict = json.load(f)
except Exception as e:
    print(json.dumps({"error": f"Failed to load skills.json: {str(e)}"}))
    sys.exit(1)

def normalize_skill(skill):
    if not skill:
        return ""
    
    # Simple normalization: lowercase, remove special chars, replace js with javascript
    key = re.sub(r'[^a-z0-9+.#]', '', skill.lower())
    key = key.replace("js", "javascript")
    
    return skill_dict.get(key, skill)

def match_roles(resume_skills, dataset):
    normalized_resume_skills = [normalize_skill(s) for s in resume_skills]
    
    recommendations = []
    
    for _, row in dataset.iterrows():
        role_name = row['role']
        if pd.isna(role_name):
            continue
            
        # Get skills required for this role (columns with value 1)
        role_skills = [col for col in dataset.columns if col != 'role' and row[col] == 1]
        
        if not role_skills:
            continue
            
        matched = [s for s in role_skills if normalize_skill(s) in normalized_resume_skills]
        
        match_percentage = round((len(matched) / len(role_skills)) * 100)
        
        if match_percentage >= 30:
            recommendations.append({
                "role": role_name,
                "matchedSkills": matched,
                "matchPercentage": match_percentage
            })
            
    # Sort by match percentage descending
    recommendations.sort(key=lambda x: x["matchPercentage"], reverse=True)
    return recommendations

def analyze_skill_gap(resume_skills, target_role, dataset):
    normalized_resume_skills = [normalize_skill(s) for s in resume_skills]
    
    # Find exact role
    role_data = dataset[dataset['role'].str.lower() == target_role.lower()]
    
    if role_data.empty:
        return {"error": f"Target role '{target_role}' not found in dataset"}
    
    role_row = role_data.iloc[0]
    required_skills = [col for col in dataset.columns if col != 'role' and role_row[col] == 1]
    
    matched_skills = [s for s in required_skills if normalize_skill(s) in normalized_resume_skills]
    missing_skills = [s for s in required_skills if normalize_skill(s) not in normalized_resume_skills]
    
    match_percentage = round((len(matched_skills) / len(required_skills)) * 100) if required_skills else 0
    
    return {
        "targetRole": role_row['role'],
        "matchPercentage": match_percentage,
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills
    }

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            return

        params = json.loads(input_data)
        skills = params.get("skills", [])
        target_role = params.get("targetRole", None)
        
        # Load dataset
        if not os.path.exists(DATASET_PATH):
            print(json.dumps({"error": "Dataset not found"}))
            return
            
        df = pd.read_csv(DATASET_PATH)
        # Convert numeric columns to 0/1, handle non-numeric errors
        for col in df.columns:
            if col != 'role':
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)

        # Process
        suggested_roles = match_roles(skills, df)
        skill_gap = None
        if target_role:
            skill_gap = analyze_skill_gap(skills, target_role, df)
            
        # Output result
        result = {
            "suggestedRoles": suggested_roles,
            "skillGap": skill_gap
        }
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
