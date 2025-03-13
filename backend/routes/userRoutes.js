const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Vieši maršrutai
router.post('/register', registerUser);
router.post('/login', loginUser);

// Apsaugoti maršrutai (reikalauja autentifikacijos)
router.route('/me')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin maršrutai
router.route('/')
  .get(protect, getUsers);

module.exports = router; 