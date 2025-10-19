# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add your frontend origin(s) here:
origins = [
    "https://hired-ai-working.vercel.app",  # replace with your actual Vercel URL
    "http://localhost:3000",                 # frontend local dev (change port if needed)
    "http://127.0.0.1:3000",
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
