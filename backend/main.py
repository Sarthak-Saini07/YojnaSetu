import os
import sys

# Ensure backend directory is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from app.main import app

if __name__ == "__main__":
    import uvicorn

    raw_port = os.environ.get("PORT", "8000")
    # Clean port to handle any accidental trailing characters
    clean_port = "".join(filter(str.isdigit, str(raw_port))) or "8000"
    port = int(clean_port)

    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
