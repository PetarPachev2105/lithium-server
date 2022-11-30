require('dotenv').config({ path: '../.env' });
const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
    // Generate token which expires in 5h
    return jwt.sign(user.toJSON(), process.env.TOKEN_SECRET, { expiresIn: '2h' });
}


function authenticateToken(token) {
    const isValid = jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
        if (err) return false;
        return true;
    });
    return isValid
}

module.exports = {
    generateAccessToken,
    authenticateToken,
}