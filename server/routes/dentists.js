import express from 'express';
import db from '../db.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router();

router.get('/', verifyToken, async (_req, res) => {
  try {
    const dentists = await db.dentist.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(dentists);
  } catch (error) {
    console.error('Error al obtener odontólogos:', error);
    res.status(500).json({ message: 'Error al obtener odontólogos' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, specialty, phone, email } = req.body;
    if (!name || !specialty || !phone || !email) {
      return res.status(400).json({ message: 'Nombre, especialidad, teléfono y correo son obligatorios' });
    }

    const dentist = await db.dentist.create({
      data: { name, specialty, phone, email, active: true }
    });
    res.status(201).json(dentist);
  } catch (error) {
    console.error('Error al crear odontólogo:', error);
    res.status(500).json({ message: 'Error al crear odontólogo' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const dentistId = Number(req.params.id);
    if (!Number.isInteger(dentistId) || dentistId <= 0) {
      return res.status(400).json({ message: 'El identificador del odontólogo no es válido' });
    }

    const { name, specialty, phone, email, active } = req.body;
    const dentist = await db.dentist.update({
      where: { id: dentistId },
      data: { name, specialty, phone, email, active }
    });
    res.json(dentist);
  } catch (error) {
    console.error('Error al actualizar odontólogo:', error);
    res.status(500).json({ message: 'Error al actualizar odontólogo' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const dentistId = Number(req.params.id);
    if (!Number.isInteger(dentistId) || dentistId <= 0) {
      return res.status(400).json({ message: 'El identificador del odontólogo no es válido' });
    }

    await db.dentist.delete({ where: { id: dentistId } });
    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar odontólogo:', error);
    res.status(500).json({ message: 'Error al eliminar odontólogo' });
  }
});

export default router;
