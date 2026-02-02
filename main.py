from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request
from pathlib import Path
import tempfile
import shutil
from typing import List
from pptx import Presentation
from copy import deepcopy
import os

app = FastAPI(title="SlideGen - PPTX Batch Processor")

# Configurar templates
templates = Jinja2Templates(directory="templates")

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Crear directorio para archivos generados si no existe
OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(exist_ok=True)


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Renderiza la página principal."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/process")
async def process_slides(
    template: UploadFile = File(...),
    names: str = Form(...),
    export_pdf: bool = Form(False),
    email_results: bool = Form(False)
):
    """
    Procesa el archivo PPTX con la lista de nombres.
    
    Args:
        template: Archivo PPTX de plantilla
        names: Lista de nombres separados por líneas
        export_pdf: Si se debe exportar a PDF
        email_results: Si se deben enviar por email
    """
    # Validar archivo
    if not template.filename.endswith(('.pptx', '.ppt')):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos .pptx o .ppt")
    
    # Procesar lista de nombres
    names_list = [name.strip() for name in names.split('\n') if name.strip()]
    
    if not names_list:
        raise HTTPException(status_code=400, detail="Debe proporcionar al menos un nombre")
    
    # Guardar archivo temporal
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as tmp_file:
        shutil.copyfileobj(template.file, tmp_file)
        tmp_path = tmp_file.name
    
    try:
        # Procesar la presentación
        output_path = OUTPUT_DIR / f"processed_{template.filename}"
        process_presentation(tmp_path, names_list, str(output_path))
        
        return {
            "status": "success",
            "message": f"Se generaron {len(names_list)} presentaciones",
            "names_count": len(names_list),
            "output_file": output_path.name
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando archivo: {str(e)}")
    
    finally:
        # Limpiar archivo temporal
        os.unlink(tmp_path)


@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """Descarga el archivo procesado."""
    file_path = OUTPUT_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )


def process_presentation(template_path: str, names: List[str], output_path: str):
    """
    Procesa la presentación reemplazando el marcador {{NOMBRE}} con cada nombre.
    
    Args:
        template_path: Ruta al archivo PPTX de plantilla
        names: Lista de nombres para insertar
        output_path: Ruta donde guardar el resultado
    """
    from generar_slides import (
        get_template_slide_indices,
        duplicate_slide_with_images,
        replace_marker_in_slide,
        delete_slide
    )
    
    MARKER = "{{NOMBRE}}"
    
    prs = Presentation(template_path)
    
    # Encontrar todas las diapositivas plantilla
    template_indices = get_template_slide_indices(prs, MARKER)
    
    if not template_indices:
        raise ValueError(f"No se encontró el marcador {MARKER} en ninguna diapositiva")
    
    # Guardar las slides plantilla originales
    template_slides = [prs.slides[i] for i in template_indices]
    
    # Generar copias para cada nombre
    for name in names:
        for template_slide in template_slides:
            new_slide = duplicate_slide_with_images(prs, template_slide)
            replace_marker_in_slide(new_slide, name, MARKER)
    
    # Eliminar las diapositivas plantilla originales
    for i in sorted(template_indices, reverse=True):
        delete_slide(prs, i)
    
    prs.save(output_path)