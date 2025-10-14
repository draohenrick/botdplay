const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  botId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bot' },
  from: String,
  to: String,
  body: String,
  direction: { type: String, enum: ['sent', 'received'] },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
