// Estado de la aplicación
let uploadedFile = null;
let namesCount = 0;

// Elementos del DOM
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const namesTextarea = document.getElementById('names-textarea');
const namesCounter = document.getElementById('names-counter');
const processBtn = document.getElementById('process-btn');
const exportPdfCheckbox = document.getElementById('export-pdf');
const emailResultsCheckbox = document.getElementById('email-results');

// Constantes
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FORMATS = ['.pptx', '.ppt'];

// Inicializar eventos
document.addEventListener('DOMContentLoaded', () => {
    setupUploadArea();
    setupNamesTextarea();
    setupProcessButton();
    setupKeyboardShortcuts();
});

// Configurar accesos de teclado
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter para procesar
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && processBtn && !processBtn.disabled) {
            processFiles();
        }
    });
}

// Configurar área de carga
function setupUploadArea() {
    // Click para abrir selector de archivo
    uploadArea.addEventListener('click', () => {
        // Si hay un archivo cargado, permitir cambiar
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-[#33272a]', 'bg-[#faeee7]', '!border-solid');
        uploadArea.classList.remove('border-[#33272a]/30');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        if (!uploadedFile) {
            uploadArea.classList.remove('border-[#33272a]', 'bg-[#faeee7]', '!border-solid');
            uploadArea.classList.add('border-[#33272a]/30');
        }
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-[#33272a]', 'bg-[#faeee7]');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    // Cambio en input de archivo
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

// Manejar selección de archivo
function handleFileSelect(file) {
    // Validar tipo de archivo
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_FORMATS.includes(fileExtension)) {
        showNotification('Solo se aceptan archivos .pptx o .ppt', 'error');
        fileInput.value = '';
        return;
    }
    
    // Validar tamaño (50MB)
    if (file.size > MAX_FILE_SIZE) {
        showNotification(`El archivo no puede ser mayor a ${MAX_FILE_SIZE / 1024 / 1024}MB`, 'error');
        fileInput.value = '';
        return;
    }
    
    uploadedFile = file;
    updateUploadUI(file.name, file.size);
    showNotification(`Archivo "${file.name}" cargado correctamente`, 'success');
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Actualizar UI del área de carga
function updateUploadUI(fileName, fileSize) {
    // Cambiar el borde y fondo del área completa
    uploadArea.classList.remove('border-[#33272a]/30', 'bg-[#faeee7]/30', 'border-dashed');
    uploadArea.classList.add('border-[#c3f0ca]', 'bg-[#c3f0ca]/20', 'border-solid');

    const formattedSize = formatFileSize(fileSize);

    // Actualizar directamente el contenido del upload-area
    uploadArea.innerHTML = `
        <div class="w-20 h-20 bg-[#c3f0ca] rounded-full border-4 border-[#33272a] flex items-center justify-center mb-4 shadow-lg animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="#33272a" class="w-10 h-10">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path>
            </svg>
        </div>
        <div class="bg-[#33272a] text-[#fffffe] px-4 py-2 rounded-lg mb-3 font-bold text-sm">
            ARCHIVO CARGADO
        </div>
        <p class="font-bold text-xl mb-1 text-[#33272a]">${fileName}</p>
        <p class="text-[#594a4e] font-semibold mb-4">${formattedSize}</p>
        <button class="text-xs font-semibold bg-[#33272a] text-[#fffffe] px-4 py-2 rounded-lg hover:bg-[#594a4e] transition-colors">
            Cambiar archivo
        </button>
    `;

    // Agregar animación de entrada
    uploadArea.style.animation = 'none';
    setTimeout(() => {
        uploadArea.style.animation = 'pulse 0.5s ease-out';
    }, 10);
}

// Configurar textarea de nombres
function setupNamesTextarea() {
    namesTextarea.addEventListener('input', updateNamesCount);
}

// Actualizar contador de nombres
function updateNamesCount() {
    const text = namesTextarea.value;
    const names = text.split('\n').filter(name => name.trim() !== '');
    namesCount = names.length;
    namesCounter.textContent = `${namesCount} nombre${namesCount !== 1 ? 's' : ''}`;
}

// Configurar botón de procesar
function setupProcessButton() {
    processBtn.addEventListener('click', processFiles);
}

// Procesar archivos
async function processFiles() {
    // Validaciones
    if (!uploadedFile) {
        showNotification('Por favor, sube un archivo PPTX primero', 'error');
        return;
    }
    
    if (namesCount === 0) {
        showNotification('Por favor, ingresa al menos un nombre', 'error');
        return;
    }
    
    // Deshabilitar botón
    processBtn.disabled = true;
    processBtn.innerHTML = `
        <span>Procesando...</span>
        <svg class="animate-spin w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    `;
    
    try {
        // Preparar FormData
        const formData = new FormData();
        formData.append('template', uploadedFile);
        formData.append('names', namesTextarea.value);
        formData.append('export_pdf', exportPdfCheckbox.checked);
        formData.append('email_results', emailResultsCheckbox.checked);
        
        // Enviar solicitud
        const response = await fetch('/api/process', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error procesando archivo');
        }
        
        const result = await response.json();
        
        // Mostrar resultado exitoso
        showNotification(
            `✅ ${result.message}. Descargando archivo...`,
            'success'
        );
        
        // Descargar archivo
        window.location.href = `/api/download/${result.output_file}`;
        
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        // Rehabilitar botón
        processBtn.disabled = false;
        processBtn.innerHTML = `
            <span>Procesar Archivos</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6 group-hover:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
            </svg>
        `;
    }
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const bgColor = type === 'error' ? '#ffc6c7' : 
                    type === 'success' ? '#c3f0ca' : '#ff8ba7';
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 p-4 rounded-xl border-2 border-[#33272a] neobrutal-shadow z-50 max-w-md animate-slide-in';
    notification.style.backgroundColor = bgColor;
    notification.innerHTML = `
        <div class="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#33272a" class="w-6 h-6 flex-shrink-0">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="font-medium text-[#33272a]">${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Botón de limpiar lista
document.getElementById('clear-list-btn')?.addEventListener('click', () => {
    namesTextarea.value = '';
    updateNamesCount();
    showNotification('Lista limpiada', 'info');
});
