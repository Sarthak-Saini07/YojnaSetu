import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import db_manager
from app.errors import register_error_handlers
from app.routers import health, auth, users, profile, schemes, eligibility, ai, admin
from app.repositories.user_repository import user_repository
from app.repositories.scheme_repository import scheme_repository

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("main")


def _load_seed_schemes():
    """Import seed schemes from app.data or scripts with safe fallback."""
    try:
        from app.data.seed_schemes import SEED_SCHEMES
        return SEED_SCHEMES
    except ImportError:
        try:
            from scripts.seed_schemes import SEED_SCHEMES
            return SEED_SCHEMES
        except ImportError:
            return []


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle context manager with database connection and initialization."""
    logger.info("Initializing application resources...")
    try:
        db_manager.connect()
        logger.info(f"Connected to MongoDB database: {settings.DATABASE_NAME}")

        # Ensure collection indexes
        user_repository.create_indexes()
        scheme_repository.create_indexes()
        logger.info("Database indexes ensured for users and schemes collections.")

        # Seed initial schemes if collection is empty
        try:
            if scheme_repository.count() == 0:
                logger.info("Schemes collection empty in MongoDB. Seeding initial verified schemes...")
                SEED_SCHEMES = _load_seed_schemes()
                from app.schemas.scheme import SchemeCreate
                for raw_scheme in SEED_SCHEMES:
                    scheme_obj = SchemeCreate(**raw_scheme)
                    scheme_repository.upsert_scheme(scheme_obj.model_dump())
                logger.info(f"Successfully seeded {len(SEED_SCHEMES)} schemes into MongoDB.")
        except Exception as seed_err:
            logger.error(f"Failed to seed schemes into MongoDB: {seed_err}")

        # Secure controlled initial admin bootstrap if no admin exists
        try:
            if user_repository.count_users({"role": "admin"}) == 0:
                logger.info(f"Bootstrapping controlled initial admin account ({settings.ADMIN_EMAIL})...")
                from app.services.auth_service import auth_service
                auth_service.create_admin_account(
                    email=settings.ADMIN_EMAIL,
                    password=settings.ADMIN_PASSWORD,
                    name="System Administrator",
                )
                logger.info("Controlled initial admin account established successfully.")
        except Exception as admin_err:
            logger.error(f"Failed to bootstrap initial admin account: {admin_err}")

    except Exception as e:
        logger.warning(
            f"Initial MongoDB connection failed: {e}. App starting in degraded state with in-memory seed data."
        )
        try:
            SEED_SCHEMES = _load_seed_schemes()
            from app.schemas.scheme import SchemeCreate
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

# Register standardized error handlers
register_error_handlers(app)

# Configure CORS for frontend integration
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Allow custom origins from environment variable (comma-separated)
custom_origins = []
if hasattr(settings, "CORS_ORIGINS") and settings.CORS_ORIGINS:
    custom_origins = [orig.strip() for orig in settings.CORS_ORIGINS.split(",") if orig.strip()]

allowed_origins = list(set(default_origins + custom_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https:\/\/.*\.onrender\.com$",
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

app.include_router(admin.router)
app.include_router(admin.router, prefix="/api")


@app.api_route("/", methods=["GET", "HEAD"], summary="Root Endpoint")
def read_root():
    return {
        "message": "Welcome to Government Scheme Recommendation System API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0",
    }
