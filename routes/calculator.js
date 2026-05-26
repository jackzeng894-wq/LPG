const express = require('express');
const router = express.Router();
const CalculatorController = require('../controllers/CalculatorController');

router.post('/compute', CalculatorController.compute);
router.post('/saveMerchant', CalculatorController.saveMerchantRule);
router.get('/merchantRules', CalculatorController.getMerchantRules);

module.exports = router;
