# Sistema de Transcripción de Sesiones Terapéuticas

Una aplicación web completa para la gestión y transcripción automática de sesiones de terapia psicológica, desarrollada con Node.js y tecnologías web modernas.

## 🎯 Características Principales

### Para Terapeutas
- **Gestión de pacientes**: Registro y administración de información de pacientes
- **Sesiones de terapia**: Crear y gestionar sesiones terapéuticas
- **Transcripción automática**: Grabación de audio con transcripción en tiempo real
- **Reportes PDF**: Generación automática de reportes detallados de sesiones
- **Dashboard completo**: Visualización de todas las sesiones y su estado

### Para Pacientes
- **Acceso seguro**: Login con credenciales proporcionadas por el terapeuta
- **Historial de sesiones**: Visualización de todas sus sesiones de terapia
- **Transcripciones**: Acceso completo a las transcripciones de sus sesiones
- **Reportes personales**: Descarga de PDFs de sus propias sesiones

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **PDFKit** - Generación de documentos PDF
- **CORS** - Manejo de políticas de origen cruzado
- **File System (fs)** - Almacenamiento en archivos JSON

### Frontend
- **HTML5** - Estructura de la aplicación
- **CSS3** - Estilos y diseño responsivo
- **JavaScript (ES6+)** - Lógica de la aplicación
- **Web Speech API** - Transcripción de voz a texto
- **Fetch API** - Comunicación con el backend

## 📋 Requisitos Previos

- **Node.js** (versión 14 o superior)
- **npm** (incluido con Node.js)
- **Navegador web moderno** con soporte para Web Speech API (Chrome recomendado)
- **Micrófono** funcional para grabación de audio

## 🚀 Instalación y Configuración

### 1. Clonar o descargar el proyecto
```bash
# Si usas Git
git clone [URL_DEL_REPOSITORIO]
cd sistema-transcripcion-terapia

# O simplemente descarga y extrae los archivos
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor
```bash
node server.js
```

### 4. Acceder a la aplicación
Abre tu navegador y ve a: `http://localhost:3001`

## 📁 Estructura del Proyecto

```
proyecto/
├── frontend/
│   ├── index.html          # Interfaz principal
│   ├── renderer.js         # Lógica del frontend
│   └── styles.css          # Estilos de la aplicación
├── server.js               # Servidor backend
├── package.json            # Dependencias del proyecto
├── README.md              # Este archivo
└── datos/                 # Carpeta de datos (se crea automáticamente)
    ├── terapeutas.json    # Base de datos de terapeutas
    ├── pacientes.json     # Base de datos de pacientes
    └── sesiones.json      # Base de datos de sesiones
```

## 🔧 Uso de la Aplicación

### Para Terapeutas

1. **Registro inicial**
   - Accede a la aplicación
   - Selecciona "Registrar Terapeuta"
   - Completa el formulario con tus datos profesionales

2. **Gestión de pacientes**
   - Desde tu dashboard, ve a "Crear Nuevo Paciente"
   - Registra la información del paciente
   - El sistema generará credenciales automáticas para el paciente

3. **Crear sesión terapéutica**
   - Selecciona "Crear Nueva Sesión"
   - Elige el paciente correspondiente
   - Asigna un nombre descriptivo a la sesión

4. **Realizar transcripción**
   - Abre la sesión activa
   - Presiona "Iniciar Grabación"
   - Habla normalmente - la transcripción aparecerá en tiempo real
   - Presiona "Detener Grabación" cuando termines
   - Finaliza la sesión cuando hayas completado toda la consulta

5. **Generar reportes**
   - Desde la lista de sesiones, haz clic en "Descargar PDF"
   - El reporte incluirá toda la información de la sesión y transcripciones

### Para Pacientes

1. **Acceso inicial**
   - Usa las credenciales proporcionadas por tu terapeuta
   - Selecciona "Login Paciente" en la página principal

2. **Consultar sesiones**
   - Ve tu historial completo de sesiones
   - Accede a las transcripciones de cada sesión
   - Descarga tus propios reportes en PDF

## 🔒 Seguridad y Privacidad

- **Datos locales**: Toda la información se almacena localmente en tu servidor
- **Sin conexión externa**: No se envían datos a servicios de terceros
- **Acceso controlado**: Los pacientes solo pueden ver sus propias sesiones
- **Credenciales únicas**: Cada paciente tiene credenciales específicas generadas automáticamente

## 🌐 API Endpoints

### Terapeutas
- `POST /registro-terapeuta` - Registrar nuevo terapeuta
- `POST /login-terapeuta` - Login de terapeuta
- `GET /sesiones/:terapeutaId/terapeuta` - Obtener sesiones del terapeuta

### Pacientes
- `POST /registro-paciente` - Registrar nuevo paciente
- `POST /login-paciente` - Login de paciente
- `GET /sesiones/:pacienteId/paciente` - Obtener sesiones del paciente

### Sesiones
- `POST /crear-sesion` - Crear nueva sesión
- `GET /sesion/:id` - Obtener detalles de sesión
- `POST /transcripcion` - Guardar transcripción
- `PUT /finalizar-sesion/:id` - Finalizar sesión
- `GET /generar-reporte/:id` - Generar y descargar PDF

## 🔍 Solución de Problemas

### La transcripción no funciona
- **Verifica el micrófono**: Asegúrate de que esté conectado y funcione
- **Permisos del navegador**: Permite el acceso al micrófono cuando lo solicite
- **Navegador compatible**: Usa Chrome o Edge (mejor compatibilidad con Web Speech API)

### Error de conexión
- **Servidor activo**: Verifica que `node server.js` esté ejecutándose
- **Puerto ocupado**: Si el puerto 3001 está ocupado, cambia el puerto en server.js
- **Firewall**: Asegúrate de que no esté bloqueando el puerto

### No se generan PDFs
- **Dependencias**: Ejecuta `npm install` para instalar todas las dependencias
- **Permisos de archivo**: Verifica que la aplicación pueda escribir en la carpeta del proyecto

## 🔄 Backup y Mantenimiento

### Realizar backup
```bash
# Copia la carpeta datos/ regularmente
cp -r datos/ backup-$(date +%Y%m%d)/
```

### Limpiar datos de prueba
```bash
# Elimina los archivos JSON para empezar desde cero
rm datos/*.json
```

## 📈 Próximas Mejoras Sugeridas

- **Base de datos**: Migrar de JSON a PostgreSQL o MongoDB
- **Autenticación**: Implementar JWT y encriptación de contraseñas
- **Cloud Storage**: Almacenamiento en la nube para respaldos automáticos
- **Notificaciones**: Emails automáticos a pacientes
- **Móvil**: Aplicación móvil complementaria
- **Análisis**: Dashboard con estadísticas y métricas


---

**Versión**: 1.0.0  
**Última actualización**: Junio 2025  
**Desarrollado con**: ❤️ y tecnologías web modernas