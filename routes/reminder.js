const express = require('express');
const router = express.Router();
const ReminderController = require('../controllers/ReminderController');

router.post('/add', ReminderController.add);
router.get('/list', ReminderController.getList);
router.post('/delete', ReminderController.delete);

module.exports = router;
