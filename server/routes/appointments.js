import express from 'express';
import db from '../db.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router();
const appointmentStatuses = new Set(['Pendiente', 'Confirmada', 'Cancelada']);

function parsePositiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

router.get('/', verifyToken, async (_req, res) => {
  try {
    const appointments = await db.appointment.findMany({ orderBy: { date: 'asc' } });
    res.json(appointments);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ message: 'Error al obtener citas' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const patientId = parsePositiveId(req.body.patientId);
    const dentistId = parsePositiveId(req.body.dentistId);
    const date = parseDate(req.body.date);
    const status = req.body.status || 'Pendiente';
    const { reason } = req.body;

    if (!patientId || !dentistId || !date || !reason || !appointmentStatuses.has(status)) {
      return res.status(400).json({ message: 'Paciente, odontólogo, fecha, estado y motivo válidos son obligatorios' });
    }

    const [patient, dentist] = await Promise.all([
      db.user.findFirst({ where: { id: patientId, role: 'patient' }, select: { id: true } }),
      db.dentist.findUnique({ where: { id: dentistId } })
    ]);
    if (!patient || !dentist) {
      return res.status(400).json({ message: 'El paciente o el odontólogo seleccionado no existe' });
    }

    const appointment = await db.appointment.create({
      data: { patientId, dentistId, date, status, reason }
    });
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ message: 'Error al crear cita' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const appointmentId = parsePositiveId(req.params.id);
    if (!appointmentId) {
      return res.status(400).json({ message: 'El identificador de la cita no es válido' });
    }

    const data = {};
    if (req.body.patientId !== undefined) {
      data.patientId = parsePositiveId(req.body.patientId);
      if (!data.patientId) return res.status(400).json({ message: 'El paciente seleccionado no es válido' });
    }
    if (req.body.dentistId !== undefined) {
      data.dentistId = parsePositiveId(req.body.dentistId);
      if (!data.dentistId) return res.status(400).json({ message: 'El odontólogo seleccionado no es válido' });
    }
    if (req.body.date !== undefined) {
      data.date = parseDate(req.body.date);
      if (!data.date) return res.status(400).json({ message: 'La fecha de la cita no es válida' });
    }
    if (req.body.status !== undefined) {
      if (!appointmentStatuses.has(req.body.status)) {
        return res.status(400).json({ message: 'El estado de la cita no es válido' });
      }
      data.status = req.body.status;
    }
    if (req.body.reason !== undefined) data.reason = req.body.reason;

    const appointment = await db.appointment.update({ where: { id: appointmentId }, data });
    res.json(appointment);
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({ message: 'Error al actualizar cita' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const appointmentId = parsePositiveId(req.params.id);
    if (!appointmentId) {
      return res.status(400).json({ message: 'El identificador de la cita no es válido' });
    }

    await db.appointment.delete({ where: { id: appointmentId } });
    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ message: 'Error al eliminar cita' });
  }
});

export default router;
