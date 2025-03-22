const express = require ('express');
const router = express.Router ();
const authController = require ('../controller/auth');

// Registers a new user, validates input and creates a profile for the user. Access: Public
router.post ('/register', authController.signup);

module.exports = router;
