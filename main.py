# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn # You'll need this to run the app

app = FastAPI()

# ✅ Allow both production (Vercel) and local dev
origins = [
    "https://hired-ai-working.vercel.app",  # your Vercel frontend URL
    "http://localhost:5173",                # local dev (Vite default, often)
    "http://127.0.0.1:5173",                # local dev (optional)
    "http://localhost:3000",                # <--- ADD THIS LINE: This is what your error message showed
    "http://127.0.0.1:3000",                # <--- ADD THIS LINE: This is what your error message showed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok"}

# You need an endpoint for '/predict-learning-path/' as well
# Based on your frontend error, it's expecting a POST request
@app.post("/predict-learning-path/")
async def predict_learning_path(data: dict): # Assuming the frontend sends a JSON body
    # This is a placeholder. You'll need to replace this with your actual logic
    # that processes the data and determines the learning path or score.
    print(f"Received data for learning path prediction: {data}")

    # Example response:
    # You might want to process 'data' here (e.g., store answers, run a model)
    # and return a meaningful response.
    response_data = {
        "message": "Learning path prediction received!",
        "predicted_path": ["module1", "module2"],
        "score": 90 # Example score
    }
    return response_data

# This block is crucial for running your FastAPI app locally
if __name__ == "__main__":
    # Ensure this port (8000) matches the one your frontend is trying to reach (127.0.0.1:8000)
    uvicorn.run(app, host="127.0.0.1", port=8000)