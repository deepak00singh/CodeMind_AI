from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze import router
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="CodeMind AI", version="1.0.0")

# Allow both local development and Vercel deployment
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://*.vercel.app",  # All Vercel deployments
]

# Get environment variable for frontend URL if set
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
