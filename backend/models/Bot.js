const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'disconnected' },
  phoneNumber: String,
  session: Object, // salvar sessão do whatsapp-web.js se quiser reconectar sem QR
});

module.exports = mongoose.model('Bot', botSchema);
