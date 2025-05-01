const express = require('express');
const router = express.Router();
const { register, login,validateToken } = require('../controllers/authController');
const auth = require('../middleware/authentication');

router.post('/register', register);
router.post('/login', login);
router.get('/validate-token', auth, validateToken);


module.exports = router;