# Skill-Synthex Career ML Module Instructions

This guide explains how to execute the training script and verify the performance metrics for the Career Path Guidance module.

## 1. How to Run Training
If you want to re-train the models with the latest dataset:

```powershell
# Navigate to the backend directory
cd "d:\B.Tech Projects\skill synthex system\skill-synthex\backend"

# Run the improved training script
python src/ml/career_training_v2.py
```

## 2. How to Check Metrics
There are three ways to view the results:

### A. Via API (Recommended)
Start the backend server:
```powershell
./start-server.ps1
```
Then, visit or call this URL:
`http://localhost:5000/api/career/metrics`

### B. Via JSON File
You can find the raw raw numerical data here:
`backend/src/ml/data/career/model_metrics.json`

### C. Visualized Plots
The script automatically generates two visual reports:
- **Comparison Graph**: `backend/src/ml/data/career/model_comparison.png`
- **Confusion Matrix**: `backend/src/ml/data/career/confusion_matrix.png`

## 3. Automated Verification
Run the included test script to verify that the API is serving the metrics correctly:
```powershell
./test-api.ps1
```

---
**Current Best Model:** XGBoost (~58% Accuracy)
**Supporting File:** `role_skill_map.json` (Used for Learning Path generation)
