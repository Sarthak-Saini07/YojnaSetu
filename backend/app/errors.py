from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Dict, Any, List


def format_validation_error(errors: List[Dict[str, Any]]) -> Dict[str, str]:
    """Map FastAPI / Pydantic validation errors into clean user-facing error codes and messages."""
    for err in errors:
        loc = err.get("loc", [])
        field_name = str(loc[-1]) if loc else ""
        err_type = str(err.get("type", ""))
        msg = str(err.get("msg", ""))

        # Check for missing required fields first
        if "missing" in err_type or "missing" in msg.lower():
            field_display = field_name.replace("_", " ").title() if field_name else "required information"
            return {
                "code": "MISSING_REQUIRED_FIELDS",
                "message": f"Required information is missing: {field_display}.",
            }

        # Check for invalid email format
        if "email" in field_name.lower() or "email" in msg.lower() or "value_error" in err_type:
            if "email" in field_name.lower() or "email" in msg.lower():
                return {
                    "code": "INVALID_EMAIL",
                    "message": "Please enter a valid email address.",
                }

    return {
        "code": "INVALID_INPUT",
        "message": "The provided information is incomplete or invalid. Please check your entries.",
    }


def register_error_handlers(app: FastAPI):
    """Register application-wide centralized error handlers with standardized responses."""

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        formatted = format_validation_error(exc.errors())
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": {
                    "code": formatted["code"],
                    "message": formatted["message"],
                    "details": exc.errors(),
                },
                "detail": formatted["message"],
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        detail_str = str(exc.detail)
        code = "HTTP_ERROR"

        if exc.status_code == status.HTTP_404_NOT_FOUND:
            code = "NOT_FOUND"
        elif exc.status_code == status.HTTP_401_UNAUTHORIZED:
            code = "INVALID_CREDENTIALS" if "credential" in detail_str.lower() or "password" in detail_str.lower() or "email" in detail_str.lower() else "UNAUTHORIZED"
        elif exc.status_code == status.HTTP_403_FORBIDDEN:
            code = "FORBIDDEN"
        elif exc.status_code == status.HTTP_409_CONFLICT:
            code = "CONFLICT"

        # Safe error message mapping
        user_message = detail_str
        if exc.status_code == status.HTTP_401_UNAUTHORIZED and code == "INVALID_CREDENTIALS":
            user_message = "Invalid email or password. Please verify your credentials."

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": code,
                    "message": user_message,
                    "details": None,
                },
                "detail": detail_str,
            },
        )
