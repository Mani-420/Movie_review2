const jwt = require('jsonwebtoken');

const generateToken = (
  payload,
  expiresIn = process.env.JWT_EXPIRES_IN || '5d'
) => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn
    });
    return token;
  } catch (error) {
    throw new Error(`Error Generating Token: ${error.message}`);
  }
};

module.exports = {
  generateToken
};
