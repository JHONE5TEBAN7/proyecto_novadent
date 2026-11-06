import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rutasAuth from './routes/auth.js';
import rutasServicios from './routes/servicios.js';
import rutasCitas from './routes/citas.js';

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/estado', (req, res) => {
  res.json({ status: 'OK', mensaje: 'API de NovaDent funcionando 🚀' });
});

app.use('/api/auth', rutasAuth);
app.use('/api/servicios', rutasServicios);
app.use('/api/citas', rutasCitas);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
