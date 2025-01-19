const express = require('express');
const router = express.Router();
const MessageController = require('../Controllers/MessageController');

// Routes for message functionality
router.post('/send', MessageController.sendMessage); // Send a message
router.get('/:chatId/history', MessageController.getChatHistory); // Get chat history
router.put('/status', MessageController.updateMessageStatus); // Update message status

module.exports = router;
