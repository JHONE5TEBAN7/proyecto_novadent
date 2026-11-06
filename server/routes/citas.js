import express from 'express';
import db from '../db.js';
import verificarToken from '../middlewares/auth.js';

const router = express.Router();

router.post('/', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { servicio_id, fecha, hora, notas } = req.body;

    if (!servicio_id || !fecha || !hora) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Servicio, fecha y hora son obligatorios'
      });
    }

    const servicioId = Number(servicio_id);

    if (!Number.isInteger(servicioId) || servicioId <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'El servicio seleccionado no es válido' });
    }

    const servicio = await db.servicio.findUnique({ where: { id: servicioId } });

    if (!servicio) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El servicio seleccionado no existe'
      });
    }

    const cita = await db.cita.create({
      data: {
        usuarioId,
        servicioId,
        fecha,
        hora,
        notas: notas || null
      }
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Cita agendada exitosamente',
      cita: {
        id: cita.id,
        usuario_id: cita.usuarioId,
        servicio_id: cita.servicioId,
        fecha: cita.fecha,
        hora: cita.hora,
        notas: cita.notas
      }
    });
  } catch (error) {
    console.error('Error al agendar cita:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
});

router.get('/mis-citas', verificarToken, async (req, res) => {
  try {
    const filas = await db.cita.findMany({
      where: { usuarioId: req.usuario.id },
      orderBy: [{ fecha: 'desc' }, { hora: 'desc' }],
      include: {
        servicio: {
          select: { nombre: true, precio: true, duracionMin: true }
        }
      }
    });

    const citas = filas.map((cita) => ({
      id: cita.id,
      fecha: cita.fecha,
      hora: cita.hora,
      estado: cita.estado,
      notas: cita.notas,
      servicio: cita.servicio.nombre,
      precio: cita.servicio.precio,
      duracion_min: cita.servicio.duracionMin
    }));

    res.json({ ok: true, cantidad: citas.length, citas });
  } catch (error) {
    console.error('Error al obtener mis citas:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
});

router.patch('/:id/cancelar', verificarToken, async (req, res) => {
  try {
    const citaId = Number(req.params.id);

    if (!Number.isInteger(citaId) || citaId <= 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Cita no encontrada o no pertenece al usuario'
      });
    }

    const cita = await db.cita.findFirst({
      where: { id: citaId, usuarioId: req.usuario.id }
    });

    if (!cita) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Cita no encontrada o no pertenece al usuario'
      });
    }

    if (cita.estado === 'cancelada') {
      return res.status(400).json({ ok: false, mensaje: 'La cita ya está cancelada' });
    }

    await db.cita.update({
      where: { id: citaId },
      data: { estado: 'cancelada' }
    });

    res.json({ ok: true, mensaje: 'Cita cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
});

export default router;