const express = require('express');
const router = express.Router();
const db = require('../db'); // Conexión a la base de datos

// GET /api/servicios -> Obtener todos los servicios
router.get('/', (req, res) => {
  try {
    const servicios = db.prepare('SELECT * FROM servicios').all();
    res.json(
        { ok: true, 
        cantidad: servicios.length,
        servicios: servicios 
    });
        } catch (error) {
      res.status(500).json({ ok: false, mensaje: 'Error al obtener los servicios' });
    }
  });

  module.exports = router;