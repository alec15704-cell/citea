const crypto = require('crypto');

class Database {
  constructor() {
    this.users = [];
    this.bookings = [];
    this.nextUserId = 1;
    this.nextBookingId = 1;
  }

  init() {
    console.log('✅ Base de datos lista');
  }

  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  registerUser(name, email, password, phone = '') {
    // Verificar si ya existe
    if (this.users.find(u => u.email === email)) {
      return null;
    }
    
    const user = {
      id: this.nextUserId++,
      name,
      email,
      password: this.hashPassword(password),
      phone,
      created_at: new Date().toISOString()
    };
    
    this.users.push(user);
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };
  }

  loginUser(email, password) {
    const hashedPassword = this.hashPassword(password);
    const user = this.users.find(u => u.email === email && u.password === hashedPassword);
    
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };
  }

  getUserById(id) {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };
  }

  createBooking(userId, businessId, serviceId, serviceName, servicePrice, date, time) {
    const booking = {
      id: this.nextBookingId++,
      user_id: userId,
      business_id: businessId,
      service_id: serviceId,
      service_name: serviceName,
      service_price: servicePrice,
      date,
      time,
      status: 'confirmada',
      created_at: new Date().toISOString()
    };
    
    this.bookings.push(booking);
    return booking;
  }

  getUserBookings(userId) {
    return this.bookings.filter(b => b.user_id === userId);
  }

  cancelBooking(bookingId, userId) {
    const index = this.bookings.findIndex(b => b.id === bookingId && b.user_id === userId);
    if (index !== -1) {
      this.bookings.splice(index, 1);
      return true;
    }
    return false;
  }

  close() {}
}

module.exports = Database;
