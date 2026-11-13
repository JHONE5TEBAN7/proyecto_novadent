import express from 'express';
import db from '../db.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router();
const patientSelect = {
  id: true,
  name: true,
  document: true,
  phone: true,
  email: true,
  createdAt: true
};

router.get('/', verifyToken, async (_req, res) => {
  try {
    const patients = await db.user.findMany({
      where: { role: 'patient' },
      orderBy: { createdAt: 'desc' },
      select: patientSelect
    });
    res.json(patients);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ message: 'Error al obtener pacientes' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, document, phone, email } = req.body;

    if (!name || !document || !phone || !email) {
      return res.status(400).json({ message: 'Nombre, documento, teléfono y correo son obligatorios' });
    }

    const patient = await db.user.create({
      data: { name, document, phone, email, role: 'patient' },
      select: patientSelect
    });
    res.status(201).json(patient);
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({ message: 'Error al crear paciente' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const patientId = Number(req.params.id);
    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({ message: 'El identificador del paciente no es válido' });
    }

    const { name, document, phone, email } = req.body;
    const existingPatient = await db.user.findFirst({
      where: { id: patientId, role: 'patient' },
      select: { id: true }
    });
    if (!existingPatient) return res.status(404).json({ message: 'No se encontró el paciente' });

    const patient = await db.user.update({
      where: { id: patientId },
      data: { name, document, phone, email },
      select: patientSelect
    });
    res.json(patient);
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({ message: 'Error al actualizar paciente' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const patientId = Number(req.params.id);
    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({ message: 'El identificador del paciente no es válido' });
    }

    const existingPatient = await db.user.findFirst({
      where: { id: patientId, role: 'patient' },
      select: { id: true }
    });
    if (!existingPatient) return res.status(404).json({ message: 'No se encontró el paciente' });

    await db.user.delete({ where: { id: patientId } });
    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ message: 'Error al eliminar paciente' });
  }
});

export default router;
