const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/conversation', chatController.createConversation);
router.post('/message', chatController.sendMessage);
router.get('/messages/:conversation_id', chatController.getMessages);
router.get('/conversations/:user_id', chatController.getConversations);
router.get('/users', chatController.getAllUsers);


module.exports = router;
