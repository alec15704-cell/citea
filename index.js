const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// --- RUTAS DE USUARIOS ---

// Registro de usuario
app.post('/api/usuarios/registro', async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email',
      [nombre, email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login simple (sin JWT para mantenerlo sencillo como se pidió)
app.post('/api/usuarios/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, nombre, email FROM usuarios WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el login' });
  }
});

// --- RUTAS DE NEGOCIOS ---

// Obtener todos los negocios
app.get('/api/negocios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM negocios');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener negocios' });
  }
});

// Obtener servicios de un negocio
app.get('/api/negocios/:id/servicios', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM servicios WHERE negocio_id = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
});

// --- RUTAS DE RESERVAS ---

// Crear una reserva
app.post('/api/reservas', async (req, res) => {
  const { usuario_id, servicio_id, fecha_reserva, hora_reserva } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reservas (usuario_id, servicio_id, fecha_reserva, hora_reserva) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, servicio_id, fecha_reserva, hora_reserva]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

// Obtener reservas de un usuario
app.get('/api/usuarios/:id/reservas', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT r.*, s.nombre as servicio_nombre, n.nombre as negocio_nombre 
       FROM reservas r 
       JOIN servicios s ON r.servicio_id = s.id 
       JOIN negocios n ON s.negocio_id = n.id 
       WHERE r.usuario_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

app.listen(port, () => {
  console.log(`Servidor Citea corriendo en el puerto ${port}`);
});
