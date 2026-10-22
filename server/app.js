const express = require('express');
const path = require('path');
require('dotenv').config();
const db = require('./db'); // Conecta e inicializa la BD

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares para procesar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de la carpeta public
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- RUTAS ---
// 1. Ruta de prueba
app.get('/api/estado', (req, res) => {
  res.json({ status: 'OK', mensaje: 'API de NovaDent funcionando 🚀' });
});

// 2. Ruta de autenticación (TU PARTE)
const rutasAuth = require('./routes/auth');
app.use('/api/auth', rutasAuth);

// (Aquí tu compañero agregará su ruta de servicios y citas luego)
const rutasServicios = require('./routes/servicios');
app.use('/api/servicios', rutasServicios);

const rutasCitas = require('./routes/citas');
app.use('/api/citas', rutasCitas);


// --- INICIO ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});