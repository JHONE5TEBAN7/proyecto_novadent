import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import servicesRoutes from './routes/servicios.js';
import appointmentsRoutes from './routes/appointments.js';
import dentistsRoutes from './routes/dentists.js';
import patientsRoutes from './routes/patients.js';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/estado', (req, res) => {
  res.json({ status: 'OK', mensaje: 'API de NovaDent funcionando 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/servicios', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/dentists', dentistsRoutes);
app.use('/api/patients', patientsRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
