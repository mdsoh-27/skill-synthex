---
description: how to run the SkillBoost V3 application
---

SkillBoost V3 is a full-stack application with a React + Vite frontend and a Node.js backend. Follow these steps to launch the platform.

### Prerequisites
- Node.js (v18+) installed
- MySQL Server running with the `skill_synthex` database

### Option 1: Quick Start (Production Mode)
This mode serves the pre-built, optimized React frontend directly from the backend server.

1. **Stop any running servers** in your terminal.
2. **Navigate to the backend directory**:
   ```powershell
   cd "d:\B.Tech Projects\skill synthex system\skill-synthex\backend"
   ```
3. **Start the server**:
   ```powershell
   npm run dev
   ```
4. **Access the App**: Open your browser and go to:
   [http://localhost:5000](http://localhost:5000)

---

### Option 2: Development Mode (For Frontend Changes)
Use this if you want to make changes to the React code and see them instantly (HMR).

1. **Start the Backend** (as shown in Option 1).
2. **Open a NEW terminal** and navigate to the frontend:
   ```powershell
   cd "d:\B.Tech Projects\skill synthex system\skill-synthex\frontend"
   ```
3. **Run the Vite dev server**:
   ```powershell
   npm run dev
   ```
4. **Access the Dev Site**: Open the URL shown in the terminal (usually [http://localhost:5173](http://localhost:5173)).
   *Note: Ensure your backend is running on port 5000 for API requests to work.*

---

### Troubleshooting
- **Database Errors**: Ensure your `.env` file in the `backend` folder has the correct MySQL credentials.
- **500 Errors on Upload**: Ensure the Python ML service artifacts are present in `backend/src/ml/data/career/`.
