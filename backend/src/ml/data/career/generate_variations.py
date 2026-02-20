import pandas as pd
import random

# Load existing dataset
df = pd.read_csv('career_dataset.csv')
columns = [col for col in df.columns if col != 'role']
roles = df['role'].unique().tolist()

# Define common skill groups to make variations more realistic
skill_groups = {
    "frontend": ["javascript", "typescript", "react", "html", "css", "tailwind", "nextjs", "vue", "angular"],
    "backend": ["python", "java", "node", "express", "sql", "mysql", "postgresql", "mongodb", "redis"],
    "data_science": ["python", "sql", "pandas", "numpy", "machine_learning", "deep_learning", "nlp", "data_analysis"],
    "devops": ["docker", "kubernetes", "aws", "gcp", "azure", "terraform", "ci_cd", "linux"],
    "testing": ["manual_testing", "automation_testing", "selenium", "pytest"],
}

new_rows = []

# Generate 5 variations for each existing role
for role in roles:
    # Determine the "logic" for this role (which group it likely belongs to)
    # Simple heuristic based on role names
    best_group = "backend" # default
    role_lower = str(role).lower()
    if any(k in role_lower for k in ["front", "web", "ui", "ux"]): best_group = "frontend"
    elif any(k in role_lower for k in ["data", "ml", "ai", "scientist"]): best_group = "data_science"
    elif any(k in role_lower for k in ["devops", "cloud", "infra", "sre"]): best_group = "devops"
    elif any(k in role_lower for k in ["test", "qa"]): best_group = "testing"

    for _ in range(8): # Add 8 variations per role
        row = {col: 0 for col in columns}
        
        # 1. Add some core skills from its group
        group_skills = skill_groups.get(best_group, [])
        num_group_skills = random.randint(3, len(group_skills))
        for skill in random.sample(group_skills, min(num_group_skills, len(group_skills))):
            if skill in row: row[skill] = 1
            
        # 2. Add some random skills from other groups (cross-functional)
        other_skills = [s for s in columns if s not in group_skills]
        num_other = random.randint(1, 5)
        for skill in random.sample(other_skills, min(num_other, len(other_skills))):
            if skill in row: row[skill] = 1
            
        row['role'] = role
        new_rows.append(row)

# Append and save
new_df = pd.DataFrame(new_rows)
updated_df = pd.concat([df, new_df], ignore_index=True)

# Drop any accidental NaN roles
updated_df = updated_df.dropna(subset=['role'])

updated_df.to_csv('career_dataset.csv', index=False)
print(f"✅ Dataset expanded. New size: {len(updated_df)} rows.")
