import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, telefono, fecha_nacimiento } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Nombre, email y contraseña son obligatorios'
      });
    }

    const existe = await db.usuario.findUnique({ where: { email } });

    if (existe) {
      return res.status(400).json({ ok: false, mensaje: 'El correo ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await db.usuario.create({
      data: {
        nombre,
        email,
        passwordHash,
        telefono: telefono || null,
        fechaNacimiento: fecha_nacimiento || null
      }
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Email y contraseña son obligatorios'
      });
    }

    const usuario = await db.usuario.findUnique({ where: { email } });

    if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );

    res.json({
      ok: true,
      mensaje: 'Login exitoso',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
});

export default router;