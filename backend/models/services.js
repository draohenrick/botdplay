const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    label: {type:String, required:true},
    description: String,
    keywords: [String],
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Service',ServiceSchema);
