const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../models/User');

module.exports = function (req, res, next) {
  //Get token
  const token = req.header('x-auth-token');
  if (!token) {
    res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decode = jwt.verify(token, config.get('jwtSecret'));
    req.user = decode.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
