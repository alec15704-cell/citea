/**
 * Base de datos simplificada que funciona en cualquier plataforma
 * Usa memoria en lugar de archivos
 */

class Database {
  constructor() {
    // Estos arrays guardan los datos en memoria
    this.users = [];
    this.bookings = [];
    this.nextUserId = 1;
    this.nextBookingId = 1;
  }

  /**
   * Inicializar (ya no necesita crear tablas)
   */
  init() {
    console.log('✅ Base de datos en memoria inicializada');
  }

  /**
   * Hash simple de contraseña
   */
  hashPassword(password) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Registrar usuario
   */
  registerUser(name, email, password, phone = '') {
    // Verificar si el email ya existe
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      return null;
    }

    const hashedPassword = this.hashPassword(password);
    const newUser = {
      id: this.nextUserId++,
      name,
      email,
      password: hashedPassword,
      phone,
      created_at: new Date().toISOString()
    };
    
    this.users.push(newUser);
    
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone
    };
  }

  /**
   * Login de usuario
   */
  loginUser(email, password) {
    const hashedPassword = this.hashPassword(password);
    const user = this.users.find(u => u.email === email && u.password === hashedPassword);
    
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };
  }

  /**
   * Obtener usuario por ID
   */
  getUserById(id) {
    const user = this.users.find(u => u.id === parseInt(id));
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };
  }

  /**
   * Crear reserva
   */
  createBooking(userId, businessId, serviceId, serviceName, servicePrice, date, time) {
    const newBooking = {
      id: this.nextBookingId++,
      user_id: parseInt(userId),
      business_id: businessId,
      service_id: serviceId,
      service_name: serviceName,
      service_price: servicePrice,
      date,
      time,
      status: 'confirmada',
      created_at: new Date().toISOString()
    };
    
    this.bookings.push(newBooking);
    
    return newBooking;
  }

  /**
   * Obtener reservas del usuario
   */
  getUserBookings(userId) {
    return this.bookings.filter(b => b.user_id === parseInt(userId));
  }

  /**
   * Cancelar reserva
   */
  cancelBooking(bookingId, userId) {
    const index = this.bookings.findIndex(b => b.id === parseInt(bookingId) && b.user_id === parseInt(userId));
    if (index !== -1) {
      this.bookings.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Cerrar conexión (no necesario para memoria)
   */
  close() {
    console.log('Base de datos cerrada');
  }
}

module.exports = Database;
