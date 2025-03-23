const express = require ('express');
const router = express.Router ();
const authController = require ('../controller/auth');

// Registers a new user, validates input and creates a profile for the user. Access: Public
router.post ('/register', authController.signup);

// Logs in new user and stores the auth data in session
router.post ('/login', authController.login);
// User login using google authentication
router.get ('/google', authController.googleLogin);
// Google callback url route definition
router.get ('/google/callback', authController.googleCallback);

module.exports = router;
