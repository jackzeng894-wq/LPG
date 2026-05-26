const express = require('express');
const router = express.Router();
const MerchantController = require('../controllers/MerchantController');

router.get('/list', MerchantController.getList);
router.get('/detail/:id', MerchantController.getDetail);

module.exports = router;
