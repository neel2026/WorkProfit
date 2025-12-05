from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.auth import router as auth_router
from api.v1.users import router as users_router
from api.v1.projects import router as projects_router
from api.v1.tasks import router as tasks_router
from api.v1.labels import router as labels_router

app = FastAPI(title="WorkProfit API", version="1.0.0")

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    # Explicitly allow known dev origins. Wildcards cannot be used with credentials.
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

# Create uploads directory if not exists
os.makedirs("uploads", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")
app.include_router(labels_router, prefix="/api/v1")
from api.v1.files import router as files_router
app.include_router(files_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Hello from WorkProfit Backend!", "status": "running"}
