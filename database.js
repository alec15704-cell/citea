/**
 * Citea - Database Manager
 * Gestiona SQLite para usuarios y reservas
 */

const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

class Database {
  constructor() {
    this.db = new sqlite3.Database('citea.db', (err) => {
      if (err) {
        console.error('Error al abrir base de datos:', err);
      } else {
        console.log('✅ Base de datos conectada');
      }
    });
  }

  /**
   * Inicializar tablas
   */
  init() {
    // Tabla de usuarios
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creando tabla users:', err);
      else console.log('✅ Tabla users lista');
    });

    // Tabla de reservas
    this.db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        business_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        service_name TEXT NOT NULL,
        service_price REAL NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT DEFAULT 'confirmada',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Error creando tabla bookings:', err);
      else console.log('✅ Tabla bookings lista');
    });
  }

  /**
   * Hash de contraseña
   */
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Registrar usuario
   */
  registerUser(name, email, password, phone, callback) {
    const hashedPassword = this.hashPassword(password);

    this.db.run(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone],
      function(err) {
        if (err) {
          callback(null);
        } else {
          callback({
            id: this.lastID,
            name,
            email,
            phone
          });
        }
      }
    );
  }

  /**
   * Login de usuario
   */
  loginUser(email, password, callback) {
    const hashedPassword = this.hashPassword(password);

    this.db.get(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, hashedPassword],
      (err, row) => {
        if (err) {
          callback(null);
        } else {
          callback(row || null);
        }
      }
    );
  }

  /**
   * Obtener usuario por ID
   */
  getUserById(id, callback) {
    this.db.get(
      'SELECT id, name, email, phone FROM users WHERE id = ?',
      [id],
      (err, row) => {
        if (err) {
          callback(null);
        } else {
          callback(row || null);
        }
      }
    );
  }

  /**
   * Crear reserva
   */
  createBooking(userId, businessId, serviceId, serviceName, servicePrice, date, time, callback) {
    this.db.run(
      `INSERT INTO bookings 
       (user_id, business_id, service_id, service_name, service_price, date, time) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, businessId, serviceId, serviceName, servicePrice, date, time],
      function(err) {
        if (err) {
          callback(null);
        } else {
          callback({
            id: this.lastID,
            user_id: userId,
            business_id: businessId,
            service_id: serviceId,
            service_name: serviceName,
            service_price: servicePrice,
            date,
            time,
            status: 'confirmada'
          });
        }
      }
    );
  }

  /**
   * Obtener reservas del usuario
   */
  getUserBookings(userId, callback) {
    this.db.all(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY date DESC',
      [userId],
      (err, rows) => {
        if (err) {
          callback([]);
        } else {
          callback(rows || []);
        }
      }
    );
  }

  /**
   * Cancelar reserva
   */
  cancelBooking(bookingId, userId, callback) {
    this.db.run(
      'DELETE FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, userId],
      function(err) {
        if (err) {
          callback(false);
        } else {
          callback(this.changes > 0);
        }
      }
    );
  }

  /**
   * Cerrar conexión
   */
  close() {
    this.db.close();
  }
}

module.exports = Database;
