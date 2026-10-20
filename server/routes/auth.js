const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Conexión a la base de datos

// POST /api/auth/registro -> Registrar un nuevo paciente
router.post('/registro', async (req, res) => {
  try {
    // 1. Recibir los datos del cuerpo de la petición
    const { nombre, email, password, telefono, fecha_nacimiento } = req.body;

    // 2. Validar que los campos obligatorios no estén vacíos
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        ok: false, 
        mensaje: 'Nombre, email y contraseña son obligatorios' 
      });
    }

    // 3. Verificar si el correo ya está registrado
    const usuarioExiste = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
    if (usuarioExiste) {
      return res.status(400).json({ 
        ok: false, 
        mensaje: 'El correo ya está registrado' 
      });
    }

    // 4. Encriptar la contraseña (10 rondas de sal)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 5. Guardar el usuario en la base de datos
    const insert = db.prepare(`
      INSERT INTO usuarios (nombre, email, password_hash, telefono, fecha_nacimiento) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    // Ejecutamos la inserción y obtenemos el ID del usuario creado
    const info = insert.run(nombre, email, passwordHash, telefono || null, fecha_nacimiento || null);

    // 6. Responder al cliente (Frontend) con éxito
    res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: info.lastInsertRowid,
        nombre: nombre,
        email: email
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      ok: false, 
      mensaje: 'Error interno del servidor' 
    });
  }
});

// POST /api/auth/login -> Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verificar que envíen los datos
    if (!email || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Email y contraseña son obligatorios' });
    }

    // 2. Buscar al usuario por email
    const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    // 3. Comparar la contraseña enviada con la encriptada en la BD
    const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordCorrecta) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    // 4. Crear el Token JWT (válido por 2 horas)
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
      process.env.JWT_SECRET, // La clave secreta del .env
      { expiresIn: process.env.JWT_EXPIRES_IN || '2h' } // Tiempo de expiración
    );

    // 5. Responder con el token y los datos del usuario (sin la contraseña)
    res.json({
      ok: true,
      mensaje: 'Login exitoso',
      token: token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;