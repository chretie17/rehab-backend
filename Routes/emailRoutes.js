const express = require('express');
const router = express.Router();
const emailController = require('../controllers/EmailController');

// ✅ Route to Send Email from Professional to Guardian
router.post('/send-email', emailController.sendEmailToGuardian);

module.exports = router;
