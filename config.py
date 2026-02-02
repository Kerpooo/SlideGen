"""
Configuración de la aplicación SlideGen
"""
from pathlib import Path
import os

# Directorios
BASE_DIR = Path(__file__).parent
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"
OUTPUT_DIR = BASE_DIR / "output"

# Crear directorios si no existen
OUTPUT_DIR.mkdir(exist_ok=True)

# Configuración de procesamiento
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_FORMATS = ('.pptx', '.ppt')
MARKER = "{{NOMBRE}}"

# Configuración de FastAPI
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))

# Configuración de archivos generados
KEEP_OUTPUT_FILES_DAYS = 7  # Días para mantener archivos generados
