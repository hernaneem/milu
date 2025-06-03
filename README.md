# Milu - AI Note Taker

Milu es un asistente de IA diseñado específicamente para profesionales de la salud mental y sus pacientes, facilitando la documentación y seguimiento de sesiones terapéuticas a través de transcripción automática y análisis inteligente.

## 🌟 Características Principales

- **Transcripción Automática en Tiempo Real**: Convierte el audio de las sesiones en texto de forma instantánea.
- **Interfaz Dual**: Acceso diferenciado para terapeutas y pacientes.
- **Gestión de Sesiones**: Organización y seguimiento de múltiples sesiones y pacientes.
- **Seguridad y Privacidad**: Sistema de autenticación para proteger la información sensible.
- **Almacenamiento Estructurado**: Guardado automático de transcripciones con marca de tiempo.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **IA y Transcripción**: OpenAI Whisper API
- **Almacenamiento**: Sistema de archivos JSON

## 🚀 Funcionalidades

### Para Terapeutas
- Registro y gestión de cuenta profesional
- Panel de control personalizado
- Gestión de pacientes
- Creación y administración de sesiones
- Acceso a transcripciones históricas

### Para Pacientes
- Registro simplificado
- Acceso a sesiones autorizadas
- Visualización de transcripciones

## 💻 Requisitos del Sistema

- Node.js
- Navegador web moderno con soporte para WebRTC
- Micrófono funcional
- Conexión a Internet estable

## 🔧 Configuración del Proyecto

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno:
   - Crear archivo `.env`
   - Agregar `OPENAI_API_KEY=tu_api_key`

4. Iniciar el servidor:
   ```bash
   node backend/server.js
   ```

## 📝 Estructura del Proyecto

```
milu-app/
├── backend/
│   ├── server.js
│   └── data/
│       ├── terapeutas.json
│       ├── pacientes.json
│       └── sesiones.json
├── index.html
├── renderer.js
├── main.js
└── package.json
```

## 🔐 Seguridad

- Autenticación requerida para acceso
- Separación de roles (terapeuta/paciente)
- Almacenamiento seguro de datos
- Encriptación de información sensible

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, asegúrate de:

1. Hacer fork del proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit de tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

---

Desarrollado con ❤️ para la comunidad de salud mental. 