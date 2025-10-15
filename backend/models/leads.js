const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    status: {type:String, enum:['new','in_progress','converted','lost'], default:'new'},
    origin: String,
    notes: String,
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Lead',LeadSchema);
