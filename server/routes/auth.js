import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

router.post('/registro', async (req, res) => {
  try {
    const { name, email, password, phone, birthDate, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios' });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ message: 'El correo ya está registrado' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone || null,
        birthDate: birthDate || null,
        role: role || 'patient'
      },
      select: { id: true, name: true, email: true, role: true }
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    const userRecord = await db.user.findUnique({ where: { email } });
    if (!userRecord?.passwordHash || !(await bcrypt.compare(password, userRecord.passwordHash))) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const accessToken = jwt.sign(
      { id: userRecord.id, email: userRecord.email, name: userRecord.name, role: userRecord.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role
    };
    res.json({ accessToken, user });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;
