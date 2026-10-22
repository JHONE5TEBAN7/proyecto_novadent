const express =require('express');
const router = express.Router();
const db = require('../db'); // Conexión a la base de datos
const verificarToken = require('../middlewares/auth'); // Middleware para verificar token

// --- RUTA PARA AGENDAR UNA CITA ---
// POST /api/citas
router.post('/', verificarToken, (req, res) => {
    try {
        //El usuario_id sale del token (gracias al middleware), NO del body
        const usuario_id = req.usuario.id;
        const { servicio_id, fecha, hora, notas } = req.body;

        //Validacion basica
        if (!servicio_id || !fecha || !hora) {
            return res.status(400).json({ ok: false, mensaje: 'Servicio, fecha y hora son obligatorios' });
        }
        
        //Veficar que el servicio existe
        const servicioExiste = db.prepare('SELECT * FROM servicios WHERE id = ?').get(servicio_id);
        if (!servicioExiste) {
            return res.status(404).json({ ok: false, mensaje: 'El servicio seleccionado no existe' });
        }

        //Insertar la cita en la base de datos
        const insert = db.prepare(`
            INSERT INTO citas (usuario_id, servicio_id, fecha, hora, notas) 
            VALUES (?, ?, ?, ?, ?)
        `);
        const info = insert.run(usuario_id, servicio_id, fecha, hora, notas || null);

        //Responder al cliente con éxito
        res.status(201).json({
            ok: true,
            mensaje: 'Cita agendada exitosamente',
            cita: {
                id: info.lastInsertRowid,
                usuario_id,
                servicio_id,
                fecha,
                hora,
                notas: notas || null
            }
        });

    } catch (error) {
        console.error('Error al agendar cita:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
    }
});

//Ruta para ver todas mis citas
// GET /api/citas/mis-citas
router.get('/mis-citas', verificarToken, (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        //Hacemos un JOIN para traer el nombre del servicio, no solo el id
        const citas = db.prepare(`
            SELECT c.id, c.fecha, c.hora, c.estado, c.notas, s.nombre as servicio, s.precio, s.duracion_min
            FROM citas c
            JOIN servicios s ON c.servicio_id = s.id
            WHERE c.usuario_id = ?
            ORDER BY c.fecha DESC, c.hora DESC
        `).all(usuario_id);
        
        res.json({ ok: true, cantidad: citas.length, citas: citas });

    } catch (error) {
        console.error('Error al obtener mis citas:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
    }
});

//Ruta para cancelar una cita
//PATCH /api/citas/:id/cancelar
router.patch('/:id/cancelar', verificarToken, (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const cita_id = req.params.id;

        //Verificar que la cita existe y pertenece al usuario
        const cita = db.prepare('SELECT * FROM citas WHERE id = ? AND usuario_id = ?').get(cita_id, usuario_id);
        if (!cita) {
            return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada o no pertenece al usuario' });
        }

        if (cita.estado === 'cancelada') {
            return res.status(400).json({ ok: false, mensaje: 'La cita ya está cancelada' });
        }

        //Actualizar el estado de la cita a "cancelada"
        const update = db.prepare('UPDATE citas SET estado = ? WHERE id = ?');
        update.run('cancelada', cita_id);
        
        res.json({ ok: true, mensaje: 'Cita cancelada exitosamente' });
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
    }
});

module.exports = router;    