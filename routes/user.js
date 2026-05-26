const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.post('/login', UserController.login);
router.get('/info', UserController.getInfo);
router.post('/update', UserController.updateInfo);
router.post('/credit', UserController.updateCredit);

module.exports = router;
