/**
 * Citea - Backend Node.js
 * Versión que funciona en Vercel y Render
 */

const express = require('express');
const cors = require('cors');
const Database = require('./database');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const db = new Database();
const JWT_SECRET = process.env.JWT_SECRET || 'citea-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Inicializar base de datos
db.init();

// ============ SERVIR data.json ============

// Ruta para obtener los negocios (centros de belleza)
app.get('/api/businesses', (req, res) => {
  try {
    // Leer el archivo data.json
    const rawData = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8');
    const data = JSON.parse(rawData);
    res.json(data.businesses);
  } catch (error) {
    console.error('Error al leer data.json:', error);
    res.status(500).json({ error: 'Error al cargar los datos' });
  }
});

// También servir data.json directamente por si acaso
app.get('/data.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data.json'));
});

// ============ AUTENTICACIÓN ============

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const user = db.registerUser(name, email, password, phone);
    
    if (!user) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const user = db.loginUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// ============ RESERVAS ============

app.post('/api/bookings', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { businessId, serviceId, serviceName, servicePrice, date, time } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Debes estar autenticado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!businessId || !serviceId || !date || !time) {
      return res.status(400).json({ error: 'Faltan datos de la reserva' });
    }

    const booking = db.createBooking(
      decoded.id,
      businessId,
      serviceId,
      serviceName,
      servicePrice,
      date,
      time
    );

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    if (error.message === 'invalid token') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bookings', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Debes estar autenticado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const bookings = db.getUserBookings(decoded.id);

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

app.delete('/api/bookings/:id', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const bookingId = req.params.id;

    if (!token) {
      return res.status(401).json({ error: 'Debes estar autenticado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const success = db.cancelBooking(bookingId, decoded.id);

    if (!success) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ RUTA PRINCIPAL ============

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============ SERVIDOR ============

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Citea Backend corriendo en http://localhost:${PORT}`);
  console.log(`🔐 JWT Secret: ${JWT_SECRET}`);
  console.log(`📊 Base de datos en memoria iniciada`);
});
