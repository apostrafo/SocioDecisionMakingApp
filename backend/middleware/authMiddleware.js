const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Apsaugoti maršrutus
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Patikrinti, ar header turi token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Gauti token iš header
      token = req.headers.authorization.split(' ')[1];

      // Verifikuoti token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Gauti vartotoją iš token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Neautorizuota, netinkamas token');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Neautorizuota, token nerastas');
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Neturite teisių atlikti šį veiksmą');
  }
};

module.exports = { protect, admin }; 