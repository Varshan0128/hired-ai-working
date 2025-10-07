from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from sklearn.preprocessing import LabelEncoder

# Initialize FastAPI app
app = FastAPI(title="Hired AI - Learning Path Engine", version="1.0")

# Allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "datasets")
DATA_DIR = os.path.join(BASE_DIR, "data")

# Helper to safely read CSV
def read_csv(file_name, folder="datasets"):
    path = os.path.join(BASE_DIR, folder, file_name)
    if os.path.exists(path):
        return pd.read_csv(path, encoding="utf-8", on_bad_lines="skip")
    else:
        raise FileNotFoundError(f"{file_name} not found in {folder}/")

@app.get("/")
def root():
    return {"message": "Learning Path Engine is running 🚀"}

# ✅ Check if all dataset files exist
@app.get("/check-data")
def check_data():
    try:
        files = os.listdir(DATASET_DIR)
        return {"available_datasets": files, "total": len(files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Predict learning style based on psychological answers
@app.post("/predict-learning-path/")
def predict_learning_path(user_answers: dict):
    """
    Accepts user's 10 psychological answers and classifies them into a learning style.
    """
    try:
        score = sum(user_answers.values())

        if score <= 20:
            category = "Short"
        elif score <= 35:
            category = "Elaborate"
        else:
            category = "Realistic"

        return {
            "user_category": category,
            "message": f"User is classified as a {category} learner.",
            "next_step": f"Fetch course recommendations using /learning-path/{{course_name}}?mode={category}"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ✅ Fetch course content from datasets
@app.get("/learning-path/{course_name}")
def get_learning_path(course_name: str, mode: str = Query("Elaborate", enum=["Short", "Elaborate", "Realistic"])):
    """
    Return learning content from dataset based on user-selected mode.
    """
    try:
        file_path = os.path.join(DATASET_DIR, f"{course_name}_learning.csv")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Dataset for '{course_name}' not found")

        df = pd.read_csv(file_path, encoding="utf-8", on_bad_lines="skip")

        # Filter content based on mode
        if mode == "Short":
            df = df.sample(frac=0.5, random_state=42)
        elif mode == "Realistic":
            df = df[df['difficulty'].isin(["Intermediate", "Advanced"])]

        data = df.to_dict(orient="records")

        return {
            "course_name": course_name.replace("_", " ").title(),
            "learning_mode": mode,
            "total_modules": len(data),
            "content": data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
