require('dotenv').config();
const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

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

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});