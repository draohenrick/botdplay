const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique:true},
    password: String,
    role: {type: String, default:'user'},
    admin: {type: Boolean, default:false},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', userSchema);
