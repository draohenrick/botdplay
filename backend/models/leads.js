const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    status: {type: String, default:'new'},
    origin: String,
    notes: String,
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Lead', leadSchema);
