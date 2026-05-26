const express = require('express');
const router = express.Router();
const GroupBuyController = require('../controllers/GroupBuyController');

router.post('/publish', GroupBuyController.publish);
router.post('/join', GroupBuyController.join);
router.post('/cancel', GroupBuyController.cancel);
router.get('/list', GroupBuyController.getList);
router.get('/detail/:groupBuyId', GroupBuyController.getDetail);
router.get('/my', GroupBuyController.getMyGroupBuys);

module.exports = router;
