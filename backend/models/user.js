const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // para versão segura, usar hash bcrypt
});

module.exports = mongoose.model('User', userSchema);
