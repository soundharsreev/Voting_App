const express = require('express');
const router = express.Router();
const { registerUser, loginUser, resetAdminPassword } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-admin', resetAdminPassword);

module.exports = router;
