import logging
import re
from typing import Optional, Dict, Any
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, PyMongoError

from app.config import settings

logger = logging.getLogger("app.database")


def mask_mongo_uri(uri: str) -> str:
    """Mask password credentials in MongoDB URI string for safe logging and error display."""
    if not uri:
        return ""
    return re.sub(r"://([^:]+):([^@]+)@", r"://\1:****@", uri)


class DatabaseManager:
    """MongoDB connection manager with connection caching, Atlas/Local detection, and graceful lifecycle."""

    client: Optional[MongoClient] = None
    db: Optional[Database] = None
    _connection_failed: bool = False

    @classmethod
    def is_atlas(cls) -> bool:
        """Return True if connection URI targets MongoDB Atlas cloud cluster."""
        uri = settings.MONGODB_URI or ""
        return "mongodb+srv://" in uri or "mongodb.net" in uri

    @classmethod
    def connect(cls) -> None:
        """Connect to MongoDB (Local or Atlas) using configured MONGODB_URI and DATABASE_NAME."""
        if cls.client is not None:
            return
        if cls._connection_failed and settings.ENVIRONMENT == "testing":
            raise RuntimeError("MongoDB connection cached failure for testing environment")

        is_cloud = cls.is_atlas()
        target_type = "MongoDB Atlas (Cloud Cluster)" if is_cloud else "Local MongoDB"
        timeout_ms = 1000 if settings.ENVIRONMENT == "testing" else (8000 if is_cloud else 3000)

        masked = mask_mongo_uri(settings.MONGODB_URI)
        logger.info(f"Connecting to {target_type} at {masked} [db: {settings.DATABASE_NAME}]...")

        try:
            client_options = {
                "serverSelectionTimeoutMS": timeout_ms,
                "connectTimeoutMS": timeout_ms,
                "maxPoolSize": 50,
                "minPoolSize": 5,
                "maxIdleTimeMS": 45000,
            }
            if is_cloud:
                try:
                    import certifi
                    client_options["tlsCAFile"] = certifi.where()
                except ImportError:
                    pass

            # Reusable pooled MongoDB client
            cls.client = MongoClient(
                settings.MONGODB_URI,
                **client_options,
            )

            # Send ping command to verify reachability and authentication
            cls.client.admin.command("ping")
            cls.db = cls.client[settings.DATABASE_NAME]
            cls._connection_failed = False
            logger.info(
                f"Successfully connected to {target_type} database: '{settings.DATABASE_NAME}'"
            )
        except (ConnectionFailure, ServerSelectionTimeoutError, PyMongoError) as e:
            safe_err = mask_mongo_uri(str(e))
            logger.error(f"Failed to connect to {target_type}: {safe_err}")
            cls.client = None
            cls.db = None
            cls._connection_failed = True
            raise RuntimeError(
                f"Could not connect to database '{settings.DATABASE_NAME}': {safe_err}"
            ) from None

    @classmethod
    def close(cls) -> None:
        """Gracefully close MongoDB client connection during application shutdown."""
        if cls.client:
            logger.info("Closing MongoDB connection pool...")
            try:
                cls.client.close()
            except Exception as e:
                logger.warning(f"Error while closing MongoDB client: {e}")
            finally:
                cls.client = None
                cls.db = None
                cls._connection_failed = False

    @classmethod
    def get_database(cls) -> Database:
        """Get cached database instance, connecting on demand if needed."""
        if cls.db is None:
            if cls._connection_failed:
                raise RuntimeError("Database connection not available (operating in degraded mode)")
            cls.connect()
        return cls.db

    @classmethod
    def check_health(cls) -> Dict[str, Any]:
        """Check MongoDB connection status for health check endpoint."""
        conn_type = "atlas" if cls.is_atlas() else "local"

        if cls.client is None:
            try:
                cls.connect()
            except Exception as e:
                return {
                    "status": "disconnected",
                    "database_name": settings.DATABASE_NAME,
                    "connection_type": conn_type,
                    "error": mask_mongo_uri(str(e)),
                }

        try:
            cls.client.admin.command("ping")
            return {
                "status": "connected",
                "database_name": settings.DATABASE_NAME,
                "connection_type": conn_type,
                "error": None,
            }
        except Exception as e:
            return {
                "status": "disconnected",
                "database_name": settings.DATABASE_NAME,
                "connection_type": conn_type,
                "error": mask_mongo_uri(str(e)),
            }


db_manager = DatabaseManager
