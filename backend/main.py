from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os

# -------------------------------------------------------------
# 🚀 Initialize FastAPI app
# -------------------------------------------------------------
app = FastAPI(
    title="Hired AI - Learning Path Engine",
    version="1.4",
    description="AI-powered personalized learning path recommender for Hired AI."
)

# -------------------------------------------------------------
# 🌐 Allow frontend connections (CORS)
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:8083",  # ✅ your current frontend port
        "http://localhost:8084",
        "http://localhost:8085",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8082",
        "http://127.0.0.1:8083",
        "http://127.0.0.1:8084",
        "http://127.0.0.1:8085"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# 📂 Define base directories
# -------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "datasets")
DATA_DIR = os.path.join(BASE_DIR, "data")

# -------------------------------------------------------------
# 📄 Helper to safely read CSV files
# -------------------------------------------------------------
def read_csv(file_name, folder="datasets"):
    path = os.path.join(BASE_DIR, folder, file_name)
    if os.path.exists(path):
        return pd.read_csv(path, encoding="utf-8", on_bad_lines="skip")
    else:
        raise FileNotFoundError(f"{file_name} not found in {folder}/")

# -------------------------------------------------------------
# 🏠 Root endpoint
# -------------------------------------------------------------
@app.get("/")
def root():
    return {"message": "✅ Learning Path Engine is running successfully!"}

# -------------------------------------------------------------
# 📊 Check available dataset files
# -------------------------------------------------------------
@app.get("/check-data")
def check_data():
    """
    Returns list of available learning datasets.
    """
    try:
        if not os.path.exists(DATASET_DIR):
            raise FileNotFoundError("Datasets folder not found")

        files = os.listdir(DATASET_DIR)
        return {
            "available_datasets": files,
            "total": len(files)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------------------------------------
# 🧠 Predict learning style (psychological mindset analyzer)
# -------------------------------------------------------------
@app.post("/predict-learning-path/")
def predict_learning_path(user_answers: dict):
    """
    Analyze user's psychological pattern and classify mindset 
    (Short, Elaborate, or Realistic) based on weighted tendencies.
    """
    try:
        if not user_answers:
            raise ValueError("No answers received from frontend.")

        # 🧩 Psychological weighting map — each question affects mindset differently
        question_weights = {
            "q1": {"A": ("Short", 2), "B": ("Elaborate", 1), "C": ("Realistic", 0)},
            "q2": {"A": ("Short", 1), "B": ("Elaborate", 2), "C": ("Realistic", 2)},
            "q3": {"A": ("Short", 2), "B": ("Elaborate", 1), "C": ("Realistic", 1)},
            "q4": {"A": ("Short", 1), "B": ("Elaborate", 2), "C": ("Realistic", 2)},
            "q5": {"A": ("Short", 2), "B": ("Elaborate", 1), "C": ("Realistic", 1)},
            "q6": {"A": ("Short", 0), "B": ("Elaborate", 2), "C": ("Realistic", 2)},
            "q7": {"A": ("Short", 1), "B": ("Elaborate", 2), "C": ("Realistic", 3)},
            "q8": {"A": ("Short", 2), "B": ("Elaborate", 1), "C": ("Realistic", 1)},
            "q9": {"A": ("Short", 1), "B": ("Elaborate", 2), "C": ("Realistic", 3)},
            "q10": {"A": ("Short", 1), "B": ("Elaborate", 2), "C": ("Realistic", 3)},
        }

        # 🧠 Track scores for each mindset
        mindset_scores = {"Short": 0, "Elaborate": 0, "Realistic": 0}

        # 🧮 Evaluate each answer
        for q, ans in user_answers.items():
            ans_clean = str(ans).strip().upper()
            if q in question_weights and ans_clean in question_weights[q]:
                category, weight = question_weights[q][ans_clean]
                mindset_scores[category] += weight

        # ✅ Identify dominant mindset
        dominant_style = max(mindset_scores, key=mindset_scores.get)

        # 🗣️ Psychological explanation for UI
        reasoning_map = {
            "Short": "You prefer structured, concise learning with clear, fast results. You focus on essentials and dislike unnecessary complexity.",
            "Elaborate": "You thrive on detailed understanding, exploring concepts deeply, and connecting ideas contextually.",
            "Realistic": "You learn best through hands-on practice, problem-solving, and real-world application of knowledge.",
        }

        # 🧭 Suggested next steps
        recommended_courses = [
            "advanced_react_patterns_learning.csv",
            "typescript_deep_dive_learning.csv",
            "machine_learning_basics_learning.csv"
        ]

        return {
            "user_category": dominant_style,
            "scores": mindset_scores,
            "message": f"User shows a {dominant_style} learning mindset.",
            "reasoning": reasoning_map[dominant_style],
            "recommended_courses": recommended_courses,
            "next_step": f"Proceed to /learning-path/{{course_name}}?mode={dominant_style}"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Mindset analysis failed: {str(e)}")

# -------------------------------------------------------------
# 📚 Fetch personalized learning path content
# -------------------------------------------------------------
@app.get("/learning-path/{course_name}")
def get_learning_path(
    course_name: str,
    mode: str = Query("Elaborate", enum=["Short", "Elaborate", "Realistic"])
):
    """
    Returns learning content from dataset based on user mode (Short, Elaborate, Realistic).
    """
    try:
        file_path = os.path.join(DATASET_DIR, f"{course_name}_learning.csv")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Dataset for '{course_name}' not found")

        df = pd.read_csv(file_path, encoding="utf-8", on_bad_lines="skip")

        # 🧩 Filter content based on mode
        if mode == "Short":
            df = df.sample(frac=0.5, random_state=42)
        elif mode == "Realistic":
            if "difficulty" in df.columns:
                df = df[df["difficulty"].isin(["Intermediate", "Advanced"])]

        data = df.to_dict(orient="records")

        return {
            "course_name": course_name.replace("_", " ").title(),
            "learning_mode": mode,
            "total_modules": len(data),
            "content": data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load course data: {str(e)}")
