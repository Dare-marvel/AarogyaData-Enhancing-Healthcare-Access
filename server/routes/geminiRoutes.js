const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');

// Route for generating chat response
router.post('/chat', geminiController.chat);

// Route for fetching chat history
router.get('/history/:sessionId', geminiController.getChatHistory);

module.exports = router;
