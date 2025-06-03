require('dotenv').config();
const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

const { jsPDF } = require('jspdf');

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const upload = multer({ dest: 'uploads/' });

// Rutas de archivos de datos
const terapeutasFile = path.join(__dirname, 'data', 'terapeutas.json');
const pacientesFile = path.join(__dirname, 'data', 'pacientes.json');

// Inicializar archivos si no existen
if (!fs.existsSync(terapeutasFile)) {
    fs.writeFileSync(terapeutasFile, JSON.stringify([], null, 2));
}
if (!fs.existsSync(pacientesFile)) {
    fs.writeFileSync(pacientesFile, JSON.stringify([], null, 2));
}

// Función para leer datos
function leerDatos(archivo) {
    return JSON.parse(fs.readFileSync(archivo, 'utf8'));
}

// Función para guardar datos
function guardarDatos(archivo, datos) {
    fs.writeFileSync(archivo, JSON.stringify(datos, null, 2));
}

// Registro de terapeuta
app.post('/registro-terapeuta', (req, res) => {
    const { nombre, apellido, correo, telefono, tiposTerapia } = req.body;
    
    const terapeutas = leerDatos(terapeutasFile);
    
    // Verificar si ya existe el correo
    if (terapeutas.find(t => t.correo === correo)) {
        return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    
    const nuevoTerapeuta = {
        id: Date.now().toString(),
        nombre,
        apellido,
        correo,
        telefono,
        tiposTerapia,
        fechaRegistro: new Date().toISOString()
    };
    
    terapeutas.push(nuevoTerapeuta);
    guardarDatos(terapeutasFile, terapeutas);
    
    res.json({ mensaje: 'Terapeuta registrado exitosamente', id: nuevoTerapeuta.id });
});

// Registro de paciente
app.post('/registro-paciente', (req, res) => {
    const { nombre, apellido, correo, telefono, edad, genero, terapeutaId } = req.body;
    
    const pacientes = leerDatos(pacientesFile);
    
    // Verificar si ya existe el correo
    if (pacientes.find(p => p.correo === correo)) {
        return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    
    const nuevoPaciente = {
        id: Date.now().toString(),
        nombre,
        apellido,
        correo,
        telefono,
        edad,
        genero,
        terapeutaId,
        fechaRegistro: new Date().toISOString()
    };
    
    pacientes.push(nuevoPaciente);
    guardarDatos(pacientesFile, pacientes);
    
    res.json({ mensaje: 'Paciente registrado exitosamente', id: nuevoPaciente.id });
});

// Login simple (por correo)
app.post('/login', (req, res) => {
    const { correo, tipo } = req.body; // tipo: 'terapeuta' o 'paciente'
    
    const archivo = tipo === 'terapeuta' ? terapeutasFile : pacientesFile;
    const usuarios = leerDatos(archivo);
    
    const usuario = usuarios.find(u => u.correo === correo);
    
    if (usuario) {
        res.json({ usuario, tipo });
    } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
    }
});

// Transcripción (mantener la funcionalidad existente)
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        const audioFile = req.file;
        
        if (!audioFile) {
            return res.status(400).json({ error: 'No se recibió archivo de audio' });
        }
        
        const fileWithExtension = audioFile.path + '.webm';
        fs.renameSync(audioFile.path, fileWithExtension);
        
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(fileWithExtension),
            model: 'whisper-1',
            language: 'es'
        });
        
        fs.unlinkSync(fileWithExtension);
        
        res.json({ text: transcription.text });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error en transcripción: ' + error.message });
    }
});

// Ruta de archivos de sesiones
const sesionesFile = path.join(__dirname, 'data', 'sesiones.json');

// Inicializar archivo de sesiones si no existe
if (!fs.existsSync(sesionesFile)) {
    fs.writeFileSync(sesionesFile, JSON.stringify([], null, 2));
}

// Crear nueva sesión
app.post('/crear-sesion', (req, res) => {
    const { terapeutaId, pacienteId, nombre } = req.body;
    
    const sesiones = leerDatos(sesionesFile);
    
    const nuevaSesion = {
        id: Date.now().toString(),
        terapeutaId,
        pacienteId,
        nombre,
        fechaCreacion: new Date().toISOString(),
        estado: 'activa', // activa, completada
        transcripciones: []
    };
    
    sesiones.push(nuevaSesion);
    guardarDatos(sesionesFile, sesiones);
    
    res.json({ mensaje: 'Sesión creada exitosamente', sesion: nuevaSesion });
});

// Obtener sesiones por usuario
app.get('/sesiones/:usuarioId/:tipo', (req, res) => {
    const { usuarioId, tipo } = req.params;
    const sesiones = leerDatos(sesionesFile);
    
    let sesionesUsuario;
    if (tipo === 'terapeuta') {
        sesionesUsuario = sesiones.filter(s => s.terapeutaId === usuarioId);
    } else {
        sesionesUsuario = sesiones.filter(s => s.pacienteId === usuarioId);
    }
    
    res.json(sesionesUsuario);
});

// Obtener pacientes de un terapeuta
app.get('/pacientes-terapeuta/:terapeutaId', (req, res) => {
    const { terapeutaId } = req.params;
    const pacientes = leerDatos(pacientesFile);
    
    const pacientesDelTerapeuta = pacientes.filter(p => p.terapeutaId === terapeutaId);
    
    res.json(pacientesDelTerapeuta);
});

// Guardar transcripción en sesión
app.post('/guardar-transcripcion', (req, res) => {
    const { sesionId, texto, timestamp } = req.body;
    
    const sesiones = leerDatos(sesionesFile);
    const sesion = sesiones.find(s => s.id === sesionId);
    
    if (!sesion) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    const nuevaTranscripcion = {
        id: Date.now().toString(),
        texto,
        timestamp: timestamp || new Date().toISOString()
    };
    
    sesion.transcripciones.push(nuevaTranscripcion);
    guardarDatos(sesionesFile, sesiones);
    
    res.json({ mensaje: 'Transcripción guardada', transcripcion: nuevaTranscripcion });
});

// Obtener sesión específica
app.get('/sesion/:sesionId', (req, res) => {
    const { sesionId } = req.params;
    const sesiones = leerDatos(sesionesFile);
    
    const sesion = sesiones.find(s => s.id === sesionId);
    
    if (!sesion) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    res.json(sesion);
});

// Generar reporte PDF de sesión
app.get('/generar-reporte/:sesionId', async (req, res) => {
    try {
        const { sesionId } = req.params;
        const sesiones = leerDatos(sesionesFile);
        const sesion = sesiones.find(s => s.id === sesionId);
        
        if (!sesion) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }
        
        // Buscar información del terapeuta y paciente
        const terapeutas = leerDatos(terapeutasFile);
        const pacientes = leerDatos(pacientesFile);
        
        const terapeuta = terapeutas.find(t => t.id === sesion.terapeutaId);
        const paciente = pacientes.find(p => p.id === sesion.pacienteId);
        
        // Crear PDF
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.text('REPORTE DE SESIÓN TERAPÉUTICA', 20, 30);
        
        // Información de la sesión
        doc.setFontSize(12);
        doc.text(`Nombre de la sesión: ${sesion.nombre}`, 20, 50);
        doc.text(`Fecha: ${new Date(sesion.fechaCreacion).toLocaleDateString()}`, 20, 60);
        doc.text(`Estado: ${sesion.estado}`, 20, 70);
        
        // Información del terapeuta
        if (terapeuta) {
            doc.text(`Terapeuta: ${terapeuta.nombre} ${terapeuta.apellido}`, 20, 90);
            doc.text(`Email: ${terapeuta.correo}`, 20, 100);
        }
        
        // Información del paciente
        if (paciente) {
            doc.text(`Paciente: ${paciente.nombre} ${paciente.apellido}`, 20, 120);
            doc.text(`Edad: ${paciente.edad} años`, 20, 130);
            doc.text(`Género: ${paciente.genero}`, 20, 140);
        }
        
        // Transcripciones
        doc.text('TRANSCRIPCIONES:', 20, 160);
        
        let yPosition = 170;
        
        if (sesion.transcripciones.length === 0) {
            doc.text('No hay transcripciones en esta sesión.', 20, yPosition);
        } else {
            sesion.transcripciones.forEach((transcripcion, index) => {
                const timestamp = new Date(transcripcion.timestamp).toLocaleTimeString();
                
                // Verificar si necesitamos una nueva página
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 30;
                }
                
                doc.setFontSize(10);
                doc.text(`[${timestamp}]`, 20, yPosition);
                yPosition += 10;
                
                // Dividir texto largo en múltiples líneas
                const lineas = doc.splitTextToSize(transcripcion.texto, 170);
                doc.text(lineas, 20, yPosition);
                yPosition += lineas.length * 5 + 10;
            });
        }
        
        // Convertir a buffer y enviar
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="reporte-${sesion.nombre.replace(/\s+/g, '-')}.pdf"`);
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ error: 'Error generando el reporte' });
    }
});

// Obtener sesiones de un paciente específico
app.get('/sesiones/:pacienteId/paciente', (req, res) => {
    try {
        const { pacienteId } = req.params;
        const sesiones = leerDatos(sesionesFile);
        const terapeutas = leerDatos(terapeutasFile);
        
        // Filtrar sesiones del paciente e incluir información del terapeuta
        const sesionesPaciente = sesiones
            .filter(sesion => sesion.pacienteId === pacienteId)
            .map(sesion => {
                const terapeuta = terapeutas.find(t => t.id === sesion.terapeutaId);
                return {
                    ...sesion,
                    terapeuta: terapeuta ? {
                        nombre: terapeuta.nombre,
                        apellido: terapeuta.apellido
                    } : null
                };
            })
            .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
            
        res.json(sesionesPaciente);
        
    } catch (error) {
        console.error('Error obteniendo sesiones del paciente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});