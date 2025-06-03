// Variables globales
let mediaRecorder;
let audioChunks = [];
let usuarioActual = null;

// Elementos del DOM
const startButton = document.getElementById('startRecord');
const stopButton = document.getElementById('stopRecord');
const status = document.getElementById('status');

// Funciones para mostrar pantallas
function mostrarPantalla(pantallaId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar la pantalla seleccionada
    document.getElementById(pantallaId).classList.add('active');
}

// Registro de terapeuta
async function registrarTerapeuta() {
    const nombre = document.getElementById('nombreTerapeuta').value;
    const apellido = document.getElementById('apellidoTerapeuta').value;
    const correo = document.getElementById('correoRegistroTerapeuta').value;
    const telefono = document.getElementById('telefonoTerapeuta').value;
    const tiposTerapiaSelect = document.getElementById('tiposTerapia');
    const tiposTerapia = Array.from(tiposTerapiaSelect.selectedOptions).map(option => option.value);
    
    // Validar campos
    if (!nombre || !apellido || !correo || !telefono) {
        document.getElementById('errorRegistroTerapeuta').textContent = 'Todos los campos son obligatorios';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3001/registro-terapeuta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                apellido,
                correo,
                telefono,
                tiposTerapia
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('successRegistroTerapeuta').textContent = 'Registro exitoso! Ahora puedes iniciar sesión.';
            document.getElementById('errorRegistroTerapeuta').textContent = '';
            
            // Limpiar formulario
            document.getElementById('nombreTerapeuta').value = '';
            document.getElementById('apellidoTerapeuta').value = '';
            document.getElementById('correoRegistroTerapeuta').value = '';
            document.getElementById('telefonoTerapeuta').value = '';
            tiposTerapiaSelect.selectedIndex = -1;
            
            setTimeout(() => {
                mostrarPantalla('loginTerapeuta');
            }, 2000);
            
        } else {
            document.getElementById('errorRegistroTerapeuta').textContent = result.error;
        }
        
    } catch (error) {
        document.getElementById('errorRegistroTerapeuta').textContent = 'Error de conexión';
        console.error(error);
    }
}

// Registro de paciente
async function registrarPaciente() {
    const nombre = document.getElementById('nombrePaciente').value;
    const apellido = document.getElementById('apellidoPaciente').value;
    const correo = document.getElementById('correoRegistroPaciente').value;
    const telefono = document.getElementById('telefonoPaciente').value;
    const edad = document.getElementById('edadPaciente').value;
    const genero = document.getElementById('generoPaciente').value;
    const correoTerapeuta = document.getElementById('correoTerapeutaAsignado').value;
    
    // Validar campos
    if (!nombre || !apellido || !correo || !telefono || !edad || !genero || !correoTerapeuta) {
        document.getElementById('errorRegistroPaciente').textContent = 'Todos los campos son obligatorios';
        return;
    }
    
    try {
        // Primero verificar que el terapeuta existe
        const loginTerapeutaResponse = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo: correoTerapeuta,
                tipo: 'terapeuta'
            })
        });
        
        if (!loginTerapeutaResponse.ok) {
            document.getElementById('errorRegistroPaciente').textContent = 'El terapeuta especificado no existe';
            return;
        }
        
        const terapeuta = await loginTerapeutaResponse.json();
        
        // Registrar paciente
        const response = await fetch('http://localhost:3001/registro-paciente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                apellido,
                correo,
                telefono,
                edad,
                genero,
                terapeutaId: terapeuta.usuario.id
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('successRegistroPaciente').textContent = 'Registro exitoso! Ahora puedes iniciar sesión.';
            document.getElementById('errorRegistroPaciente').textContent = '';
            
            // Limpiar formulario
            document.getElementById('nombrePaciente').value = '';
            document.getElementById('apellidoPaciente').value = '';
            document.getElementById('correoRegistroPaciente').value = '';
            document.getElementById('telefonoPaciente').value = '';
            document.getElementById('edadPaciente').value = '';
            document.getElementById('generoPaciente').value = '';
            document.getElementById('correoTerapeutaAsignado').value = '';
            
            setTimeout(() => {
                mostrarPantalla('loginPaciente');
            }, 2000);
            
        } else {
            document.getElementById('errorRegistroPaciente').textContent = result.error;
        }
        
    } catch (error) {
        document.getElementById('errorRegistroPaciente').textContent = 'Error de conexión';
        console.error(error);
    }
}

// Login de terapeuta
async function loginTerapeuta() {
    const correo = document.getElementById('correoTerapeuta').value;
    
    if (!correo) {
        document.getElementById('errorLoginTerapeuta').textContent = 'El correo es obligatorio';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo,
                tipo: 'terapeuta'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            usuarioActual = result;
            document.getElementById('bienvenidaTerapeuta').textContent = 
                `Bienvenido, ${result.usuario.nombre} ${result.usuario.apellido}`;
            mostrarPantalla('dashboardTerapeuta');
            await cargarDatosTerapeuta();
            
        } else {
            document.getElementById('errorLoginTerapeuta').textContent = result.error;
        }
        
    } catch (error) {
        document.getElementById('errorLoginTerapeuta').textContent = 'Error de conexión';
        console.error(error);
    }
}

// Login de paciente
async function loginPaciente() {
    const correo = document.getElementById('correoPaciente').value;
    
    if (!correo) {
        document.getElementById('errorLoginPaciente').textContent = 'El correo es obligatorio';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo,
                tipo: 'paciente'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            usuarioActual = result;
            document.getElementById('bienvenidaPaciente').textContent = 
                `Bienvenido, ${result.usuario.nombre} ${result.usuario.apellido}`;
            mostrarPantalla('dashboardPaciente');
            
        } else {
            document.getElementById('errorLoginPaciente').textContent = result.error;
        }
        
    } catch (error) {
        document.getElementById('errorLoginPaciente').textContent = 'Error de conexión';
        console.error(error);
    }
}

// Logout
function logout() {
    usuarioActual = null;
    mostrarPantalla('inicio');
}

// Cargar datos del terapeuta
async function cargarDatosTerapeuta() {
    if (!usuarioActual || usuarioActual.tipo !== 'terapeuta') return;
    
    await cargarPacientesTerapeuta();
    await cargarSesionesTerapeuta();
}

// Cargar pacientes del terapeuta
async function cargarPacientesTerapeuta() {
    try {
        const response = await fetch(`http://localhost:3001/pacientes-terapeuta/${usuarioActual.usuario.id}`);
        const pacientes = await response.json();
        
        // Mostrar lista de pacientes
        const listaPacientes = document.getElementById('listaPacientes');
        if (pacientes.length === 0) {
            listaPacientes.innerHTML = '<p>No tienes pacientes registrados aún.</p>';
        } else {
            listaPacientes.innerHTML = pacientes.map(p => 
                `<div style="padding: 10px; border: 1px solid #ddd; margin: 5px 0; border-radius: 5px;">
                    <strong>${p.nombre} ${p.apellido}</strong><br>
                    Email: ${p.correo} | Teléfono: ${p.telefono}<br>
                    Edad: ${p.edad} | Género: ${p.genero}
                </div>`
            ).join('');
        }
        
        // Llenar select de pacientes para crear sesión
        const selectPaciente = document.getElementById('pacienteParaSesion');
        selectPaciente.innerHTML = '<option value="">Seleccionar paciente...</option>';
        pacientes.forEach(p => {
            selectPaciente.innerHTML += `<option value="${p.id}">${p.nombre} ${p.apellido}</option>`;
        });
        
    } catch (error) {
        console.error('Error cargando pacientes:', error);
        document.getElementById('listaPacientes').innerHTML = '<p>Error cargando pacientes</p>';
    }
}

// Cargar sesiones del terapeuta
async function cargarSesionesTerapeuta() {
    try {
        const response = await fetch(`http://localhost:3001/sesiones/${usuarioActual.usuario.id}/terapeuta`);
        const sesiones = await response.json();
        
        const listaSesiones = document.getElementById('listaSesiones');
        if (sesiones.length === 0) {
            listaSesiones.innerHTML = '<p>No has creado sesiones aún.</p>';
        } else {
            listaSesiones.innerHTML = sesiones.map(s => 
                `<div style="padding: 15px; border: 1px solid #ddd; margin: 10px 0; border-radius: 8px; background-color: #f9f9f9;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <strong style="font-size: 16px;">${s.nombre}</strong> 
                            <span style="background-color: ${s.estado === 'activa' ? '#28a745' : '#6c757d'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px;">
                                ${s.estado}
                            </span><br>
                            <small style="color: #666;">Creada: ${new Date(s.fechaCreacion).toLocaleDateString()}</small><br>
                            <small style="color: #666;">Transcripciones: ${s.transcripciones.length}</small>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <button class="primary" onclick="abrirSesion('${s.id}')" style="font-size: 12px; padding: 5px 10px;">
                                Abrir Sesión
                            </button>
                            <button class="success" onclick="descargarReporte('${s.id}', '${s.nombre}', event)" style="font-size: 12px; padding: 5px 10px;">
                                📄 Descargar PDF
                            </button>
                        </div>
                    </div>
                </div>`
            ).join('');
        }
        
    } catch (error) {
        console.error('Error cargando sesiones:', error);
        document.getElementById('listaSesiones').innerHTML = '<p>Error cargando sesiones</p>';
    }
}

// Crear nueva sesión
async function crearSesion() {
    const pacienteId = document.getElementById('pacienteParaSesion').value;
    const nombreSesion = document.getElementById('nombreSesion').value;
    
    if (!pacienteId || !nombreSesion) {
        document.getElementById('errorCrearSesion').textContent = 'Todos los campos son obligatorios';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3001/crear-sesion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                terapeutaId: usuarioActual.usuario.id,
                pacienteId,
                nombre: nombreSesion
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('successCrearSesion').textContent = 'Sesión creada exitosamente!';
            document.getElementById('errorCrearSesion').textContent = '';
            
            // Limpiar formulario
            document.getElementById('pacienteParaSesion').value = '';
            document.getElementById('nombreSesion').value = '';
            
            // Recargar lista de sesiones
            await cargarSesionesTerapeuta();
            
        } else {
            document.getElementById('errorCrearSesion').textContent = result.error;
        }
        
    } catch (error) {
        document.getElementById('errorCrearSesion').textContent = 'Error de conexión';
        console.error(error);
    }
}

// Abrir sesión para grabar
async function abrirSesion(sesionId) {
    try {
        // Guardar ID de sesión actual
        window.sesionActual = sesionId;
        
        // Cargar información de la sesión
        const response = await fetch(`http://localhost:3001/sesion/${sesionId}`);
        const sesion = await response.json();
        
        if (response.ok) {
            document.getElementById('nombreSesionActual').innerHTML = 
                `<strong>${sesion.nombre}</strong><br>
                Creada: ${new Date(sesion.fechaCreacion).toLocaleDateString()}<br>
                Transcripciones guardadas: ${sesion.transcripciones.length}`;
                
            // Mostrar transcripciones existentes
            if (sesion.transcripciones.length > 0) {
                const transcriptionDiv = document.getElementById('transcription');
                transcriptionDiv.innerHTML = sesion.transcripciones.map(t => 
                    `<div style="margin-bottom: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                        <small style="color: #666;">${new Date(t.timestamp).toLocaleTimeString()}</small><br>
                        ${t.texto}
                    </div>`
                ).join('');
            }
            
            mostrarPantalla('grabacion');
        } else {
            alert('Error cargando la sesión');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// Funcionalidad de grabación (mantener la existente)
if (startButton) {
    startButton.addEventListener('click', startRecording);
}
if (stopButton) {
    stopButton.addEventListener('click', stopRecording);
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await transcribeAudio(audioBlob);
        };
        
        mediaRecorder.start();
        startButton.disabled = true;
        stopButton.disabled = false;
        status.textContent = 'Grabando...';
        
    } catch (error) {
        console.error('Error al acceder al micrófono:', error);
        status.textContent = 'Error: No se pudo acceder al micrófono';
    }
}

function stopRecording() {
    mediaRecorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
    status.textContent = 'Procesando transcripción...';
}

// Transcribir audio y guardar en sesión
async function transcribeAudio(audioBlob) {
    try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        
        const response = await fetch('http://localhost:3001/transcribe', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.text) {
            // Guardar transcripción en la sesión
            await guardarTranscripcionEnSesion(result.text);
            displayTranscription(result.text);
        } else {
            status.textContent = 'Error en la transcripción';
        }
        
        audioChunks = [];
        
    } catch (error) {
        console.error('Error:', error);
        status.textContent = 'Error de conexión con el servidor';
    }
}

// Guardar transcripción en la sesión actual
async function guardarTranscripcionEnSesion(texto) {
    if (!window.sesionActual) return;
    
    try {
        const response = await fetch('http://localhost:3001/guardar-transcripcion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sesionId: window.sesionActual,
                texto,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            console.error('Error guardando transcripción');
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Mostrar transcripción en tiempo real
function displayTranscription(text) {
    status.textContent = 'Transcripción completada';
    const transcriptionDiv = document.getElementById('transcription');
    if (transcriptionDiv) {
        const timestamp = new Date().toLocaleTimeString();
        const newTranscription = `
            <div style="margin-bottom: 10px; padding: 10px; background-color: #e8f5e8; border-radius: 5px; border-left: 4px solid #28a745;">
                <small style="color: #666;">${timestamp}</small><br>
                ${text}
            </div>
        `;
        
        // Si ya hay contenido, agregarlo al final
        if (transcriptionDiv.innerHTML.includes('aparecerá aquí')) {
            transcriptionDiv.innerHTML = newTranscription;
        } else {
            transcriptionDiv.innerHTML += newTranscription;
        }
        
        // Scroll automático hacia abajo
        transcriptionDiv.scrollTop = transcriptionDiv.scrollHeight;
    }
}

// Finalizar sesión
async function finalizarSesion() {
    if (!window.sesionActual) return;
    
    if (confirm('¿Estás seguro de que quieres finalizar esta sesión?')) {
        try {
            // Aquí podríamos agregar una ruta para marcar la sesión como completada
            // Por ahora solo regresamos al dashboard
            
            window.sesionActual = null;
            mostrarPantalla('dashboardTerapeuta');
            await cargarSesionesTerapeuta(); // Recargar lista
            
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Descargar reporte PDF
async function descargarReporte(sesionId, nombreSesion, event) {
    try {
        // Mostrar indicador de carga
        const button = event.target;
        const textoOriginal = button.innerHTML;
        button.innerHTML = '⏳ Generando...';
        button.disabled = true;
        
        const response = await fetch(`http://localhost:3001/generar-reporte/${sesionId}`);
        
        if (response.ok) {
            // Crear blob del PDF
            const blob = await response.blob();
            
            // Crear enlace de descarga
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `reporte-${nombreSesion.replace(/\s+/g, '-')}.pdf`;
            
            // Agregar al DOM, hacer clic y remover
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Mostrar mensaje de éxito
            alert('Reporte descargado exitosamente!');
            
        } else {
            alert('Error al generar el reporte');
        }
        
        // Restaurar botón
        button.innerHTML = textoOriginal;
        button.disabled = false;
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al generar el reporte');
        
        // Restaurar botón en caso de error
        const button = event.target;
        button.innerHTML = '📄 Descargar PDF';
        button.disabled = false;
    }
}