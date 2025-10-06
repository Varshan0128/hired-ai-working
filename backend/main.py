from fastapi import FastAPI
import pandas as pd
import os

app = FastAPI(title="Hired AI - Learning Path API", version="1.0")

# --- Base Path ---
BASE = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE, "data")

# --- Read CSV Files ---
try:
    learning_path = pd.read_csv(os.path.join(DATA_PATH, "learning_path_core.csv"))
    psych_questions = pd.read_csv(os.path.join(DATA_PATH, "psychological_questions.csv"))
    skill_map = pd.read_csv(os.path.join(DATA_PATH, "skill_mapping.csv"))
    courses = pd.read_csv(os.path.join(DATA_PATH, "course_catalog.csv"))
except Exception as e:
    print(f"Error loading datasets: {e}")

# --- Routes ---
@app.get("/")
def root():
    return {"message": "Backend is running 🚀"}

@app.get("/check-datasets")
def check_datasets():
    """Check if datasets are properly loaded"""
    try:
        return {
            "learning_path_rows": len(learning_path),
            "psychological_questions_rows": len(psych_questions),
            "skill_map_rows": len(skill_map),
            "courses_rows": len(courses),
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/get-questions")
def get_questions():
    """Returns a few sample psychological questions"""
    try:
        return psych_questions.sample(5).to_dict(orient="records")
    except Exception as e:
        return {"error": str(e)}

