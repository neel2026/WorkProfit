from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.auth import router as auth_router
from api.v1.users import router as users_router
from api.v1.projects import router as projects_router

app = FastAPI(title="WorkProfit API", version="1.0.0")

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Hello from WorkProfit Backend!", "status": "running"}
