import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filas = await db.servicio.findMany();

    const servicios = filas.map((servicio) => ({
      id: servicio.id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      duracion_min: servicio.duracionMin,
      precio: servicio.precio
    }));

    res.json({ ok: true, cantidad: servicios.length, servicios });
  } catch (error) {
    console.error('Error al obtener los servicios:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener los servicios' });
  }
});

export default router;