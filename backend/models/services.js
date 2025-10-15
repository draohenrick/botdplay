const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    label: String,
    description: String,
    keywords: [String],
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Service', serviceSchema);
