import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import db_manager
from app.routers import health, auth, users, profile, schemes, eligibility, ai

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle context manager."""
    logger.info("Initializing application resources...")
    try:
        db_manager.connect()
    except Exception as e:
        logger.warning(
            f"Initial MongoDB connection failed: {e}. App starting in degraded state with in-memory seed data."
        )
        try:
            from scripts.seed_schemes import SEED_SCHEMES
            from app.schemas.scheme import SchemeCreate
            from app.repositories.scheme_repository import scheme_repository
            for raw_scheme in SEED_SCHEMES:
                scheme_obj = SchemeCreate(**raw_scheme)
                scheme_repository.upsert_scheme(scheme_obj.model_dump())
            logger.info(f"Loaded {len(SEED_SCHEMES)} seed schemes into in-memory repository.")
        except Exception as seed_err:
            logger.error(f"Failed to load in-memory seed schemes: {seed_err}")
    yield
    logger.info("Shutting down application resources...")
    db_manager.close()


app = FastAPI(
    title="Government Scheme Recommendation System API",
    description="API backend for personalized government scheme discovery, authentication, scheme management, and deterministic eligibility evaluation.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for frontend integration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(health.router, prefix="/api")

app.include_router(auth.router)
app.include_router(auth.router, prefix="/api")

app.include_router(users.router)
app.include_router(users.router, prefix="/api")

app.include_router(profile.router)
app.include_router(profile.router, prefix="/api")


app.include_router(schemes.router)
app.include_router(schemes.router, prefix="/api")

app.include_router(eligibility.router)
app.include_router(eligibility.router, prefix="/api")

app.include_router(ai.router)
app.include_router(ai.router, prefix="/api")


@app.get("/", summary="Root Endpoint")
def read_root():
    return {
        "message": "Welcome to Government Scheme Recommendation System API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0",
    }
