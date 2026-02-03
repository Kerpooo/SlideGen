# SlideGen - Generador de Presentaciones Personalizadas

Aplicación web para generar presentaciones PPTX personalizadas automáticamente.

## 🚀 Características

- **Interfaz moderna** con diseño neobrutalista
- **Carga de archivos** por drag & drop o click
- **Procesamiento batch** de múltiples nombres
- **Preserva formato** (negritas, cursivas, colores)
- **API REST** con FastAPI
- **Templates modulares** con Jinja2

## 📋 Requisitos

- Python 3.12+
- uv (gestor de paquetes)

## 🛠️ Instalación

1. Instalar dependencias:
```bash
uv sync
```

2. O instalar manualmente:
```bash
uv pip install fastapi uvicorn python-pptx jinja2 python-multipart
```

## 🎯 Uso

### Iniciar servidor

```bash
uvicorn main:app --reload
```

La aplicación estará disponible en: http://localhost:8000

### Desde la interfaz web

1. Sube tu plantilla PPTX que contenga el marcador `{{name}}`
2. Ingresa los nombres (uno por línea)
3. Haz clic en "Process Files"
4. Descarga el archivo generado automáticamente

### Usar el script directo

```bash
python generar_slides.py
```

Configurar en el archivo:
- `TEMPLATE_PPTX`: Ruta a tu plantilla
- `OUTPUT_PPTX`: Nombre del archivo de salida
- `NAMES_FILE`: Archivo con lista de nombres
- `MARKER`: Marcador a reemplazar (por defecto `{{NOMBRE}}`)

## 📁 Estructura del Proyecto

```
SlicedCarrots/
├── main.py                      # Servidor FastAPI
├── generar_slides.py           # Lógica de procesamiento
├── pyproject.toml              # Dependencias
├── templates/                  # Templates HTML (Jinja2)
│   ├── base.html              # Layout base
│   ├── index.html             # Página principal
│   └── components/            # Componentes reutilizables
│       ├── navbar.html
│       ├── hero.html
│       ├── upload_section.html
│       ├── recipient_section.html
│       ├── process_button.html
│       └── footer_sections.html
├── static/                     # Archivos estáticos
│   └── app.js                 # JavaScript frontend
└── output/                     # Archivos generados
```

## 🎨 Marcadores

En tu plantilla PPTX, usa el marcador `{{name}}` donde quieras que aparezca el nombre personalizado.

### Ejemplo:

```
Certificado de Reconocimiento

Otorgado a: {{name}}

Por su excelente desempeño...
```

## 🔧 API Endpoints

### `GET /`
Renderiza la interfaz web

### `POST /api/process`
Procesa un archivo PPTX con nombres

**FormData:**
- `template`: Archivo PPTX (File)
- `names`: Lista de nombres separados por líneas (string)
- `export_pdf`: Exportar a PDF (boolean, opcional)
- `email_results`: Enviar por email (boolean, opcional)

**Response:**
```json
{
  "status": "success",
  "message": "Se generaron 5 presentaciones",
  "names_count": 5,
  "output_file": "processed_plantilla.pptx"
}
```

### `GET /api/download/{filename}`
Descarga el archivo procesado

## 🎯 Características Técnicas

- **Duplicación perfecta de slides** incluyendo imágenes y relaciones
- **Preservación de formato** (fuentes, colores, estilos)
- **Manejo robusto** de marcadores partidos en múltiples runs
- **Carga asíncrona** de archivos
- **Validación** de tipos y tamaños de archivo
- **Notificaciones** en tiempo real

## 📝 Notas

- El marcador puede estar en cualquier cuadro de texto de la diapositiva
- Se mantiene el formato original del texto
- Las imágenes y elementos gráficos se preservan
- Tamaño máximo de archivo: 50MB

## 🐛 Troubleshooting

### Error: "No se encontró el marcador"
Asegúrate de que tu plantilla PPTX contenga exactamente `{{name}}` en al menos una diapositiva.

### Las imágenes no aparecen
Verifica que tu plantilla original tenga las imágenes correctamente embebidas (no vinculadas).

## 📄 Licencia

MIT


## Deploys
cd /var/www/SlideGen
git pull
uv sync
bun run build:css
sudo systemctl restart slidegen
sudo systemctl reload nginx
