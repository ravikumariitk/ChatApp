const bcrypt = require('bcrypt');
const saltRounds = 5;

async function hashPassword(password) {
    return password
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
}

// Function to compare a password with a hashed password
async function comparePassword(password, hashedPassword) {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (error) {
        console.error('Error comparing password:', error);
        throw error;
    }
}

module.exports = { hashPassword, comparePassword };
