const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// Nombre del archivo de la BD (definido en .env o por defecto)
const dbFile = process.env.DB_FILE || 'novadent.db';
// Guardamos la base de datos en la raíz del proyecto
const dbPath = path.join(__dirname, '..', dbFile);

// Conectar a la base de datos (si el archivo no existe, lo crea)
const db = new Database(dbPath);

// Mejora el rendimiento de la base de datos
db.pragma('journal_mode = WAL');

console.log(`✅ Conexión a SQLite establecida en: ${dbPath}`);

// 1. Función para crear las tablas
function crearTablas() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      telefono TEXT,
      fecha_nacimiento TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS servicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      duracion_min INTEGER,
      precio REAL
    );

    CREATE TABLE IF NOT EXISTS citas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      servicio_id INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      estado TEXT DEFAULT 'pendiente',
      notas TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (servicio_id) REFERENCES servicios(id)
    );
  `);
  console.log('✅ Tablas (usuarios, servicios, citas) creadas/verificadas');
}

// 2. Función para insertar los servicios iniciales
function insertarServicios() {
  const count = db.prepare('SELECT COUNT(*) as count FROM servicios').get();
  
  if (count.count === 0) {
    const insert = db.prepare(`
      INSERT INTO servicios (nombre, descripcion, duracion_min, precio) 
      VALUES (?, ?, ?, ?)
    `);

    const servicios = [
      ['Limpieza dental', 'Limpieza profunda para eliminar sarro y placa.', 45, 50.0],
      ['Ortodoncia', 'Consulta y ajuste de brackets.', 30, 40.0],
      ['Revisión general', 'Chequeo completo del estado bucal.', 20, 30.0],
      ['Blanqueamiento', 'Tratamiento estético para aclarar el tono dental.', 60, 120.0],
      ['Extracción simple', 'Extracción de pieza dental sin cirugía compleja.', 40, 80.0]
    ];

    // Se usa una transacción para insertar todos de golpe de forma segura
    const insertMany = db.transaction((servicios) => {
      for (const s of servicios) insert.run(s[0], s[1], s[2], s[3]);
    });

    insertMany(servicios);
    console.log('✅ 5 servicios iniciales insertados en la BD');
  } else {
    console.log('ℹ️ Los servicios ya existen, no se duplicaron');
  }
}

// Ejecutamos las funciones
crearTablas();
insertarServicios();

// Exportamos la conexión para usarla en las rutas (auth, citas, servicios)
module.exports = db;