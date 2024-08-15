const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    otp: { type: String, required: true },
    token: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
    username:{ type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const cookieSchema = new mongoose.Schema({
    phone:{ type: String, required: true },
    token: { type: String, required: true },
});


const Otp = mongoose.model('Otp', otpSchema);
const Cookie = mongoose.model('cookies', cookieSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Otp,User,Cookie};