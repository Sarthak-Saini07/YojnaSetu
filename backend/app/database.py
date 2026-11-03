import logging
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.config import settings

logger = logging.getLogger(__name__)


class DatabaseManager:
    """MongoDB connection manager utilizing PyMongo with connection caching."""

    client: Optional[MongoClient] = None
    db: Optional[Database] = None
    _connection_failed: bool = False

    @classmethod
    def connect(cls) -> None:
        """Connect to MongoDB Atlas using MONGODB_URI."""
        if cls.client is not None:
            return
        if cls._connection_failed and settings.ENVIRONMENT == "testing":
            raise RuntimeError("MongoDB connection cached failure for testing environment")

        timeout_ms = 1000 if settings.ENVIRONMENT == "testing" else 5000
        try:
            logger.info("Connecting to MongoDB Atlas...")
            cls.client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=timeout_ms,
                connectTimeoutMS=timeout_ms,
            )
            # Send a ping to verify connection
            cls.client.admin.command("ping")
            cls.db = cls.client[settings.DATABASE_NAME]
            cls._connection_failed = False
            logger.info(
                f"Successfully connected to MongoDB Atlas database: {settings.DATABASE_NAME}"
            )
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB Atlas: {e}")
            cls.client = None
            cls.db = None
            cls._connection_failed = True
            raise RuntimeError(
                f"Could not connect to MongoDB Atlas database: {e}"
            ) from e

    @classmethod
    def close(cls) -> None:
        """Close MongoDB Atlas client connection."""
        if cls.client:
            logger.info("Closing MongoDB connection...")
            cls.client.close()
            cls.client = None
            cls.db = None
            cls._connection_failed = False

    @classmethod
    def get_database(cls) -> Database:
        """Get database instance."""
        if cls.db is None:
            if cls._connection_failed:
                raise RuntimeError("Database connection not available (operating in degraded mode)")
            cls.connect()
        return cls.db

    @classmethod
    def check_health(cls) -> dict:
        """Check MongoDB connection status."""
        if cls.client is None:
            try:
                cls.connect()
            except Exception as e:
                return {
                    "status": "disconnected",
                    "database_name": settings.DATABASE_NAME,
                    "error": str(e),
                }

        try:
            cls.client.admin.command("ping")
            return {
                "status": "connected",
                "database_name": settings.DATABASE_NAME,
                "error": None,
            }
        except Exception as e:
            return {
                "status": "disconnected",
                "database_name": settings.DATABASE_NAME,
                "error": str(e),
            }


db_manager = DatabaseManager
