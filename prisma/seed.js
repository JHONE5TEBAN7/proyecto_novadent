import db from '../server/db.js';

const serviciosIniciales = [
  { nombre: 'Limpieza dental', descripcion: 'Limpieza profunda para eliminar sarro y placa.', duracionMin: 45, precio: 50 },
  { nombre: 'Ortodoncia', descripcion: 'Consulta y ajuste de brackets.', duracionMin: 30, precio: 40 },
  { nombre: 'Revisión general', descripcion: 'Chequeo completo del estado bucal.', duracionMin: 20, precio: 30 },
  { nombre: 'Blanqueamiento', descripcion: 'Tratamiento estético para aclarar el tono dental.', duracionMin: 60, precio: 120 },
  { nombre: 'Extracción simple', descripcion: 'Extracción de pieza dental sin cirugía compleja.', duracionMin: 40, precio: 80 }
];

try {
  for (const servicio of serviciosIniciales) {
    const existe = await db.servicio.findFirst({
      where: { nombre: servicio.nombre }
    });

    if (!existe) {
      await db.servicio.create({ data: servicio });
    }
  }

  console.log('Servicios iniciales cargados');
} catch (error) {
  console.error('Error al cargar servicios:', error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}