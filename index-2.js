const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de Citea!');
});

// Ruta de ejemplo para probar la conexión a la base de datos
app.get('/test-db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ message: 'Conexión a la base de datos exitosa', time: result.rows[0].now });
  } catch (err) {
    console.error('Error al conectar a la base de datos', err);
    res.status(500).json({ error: 'Error al conectar a la base de datos' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
