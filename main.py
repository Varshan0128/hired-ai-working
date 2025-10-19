# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ Allow both production (Vercel) and local dev
origins = [
    "https://hired-ai-working.vercel.app",  # your Vercel frontend URL
    "http://localhost:5173",                # local dev (Vite default)
    "http://127.0.0.1:5173",                # local dev (optional)
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
