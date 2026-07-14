const express = require('express');
const router = express.Router();
const { register, login, dluaSsoCallback } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/dlua-sso-callback', dluaSsoCallback);

module.exports = router;