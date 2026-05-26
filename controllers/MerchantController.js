const MerchantService = require('../services/MerchantService');

class MerchantController {
  static async getList(req, res) {
    const { openid } = req.headers;
    const { latitude, longitude, merchantType } = req.query;
    const result = await MerchantService.getList(openid, parseFloat(latitude), parseFloat(longitude), merchantType);
    res.json(result);
  }

  static async getDetail(req, res) {
    const { id } = req.params;
    const result = await MerchantService.getDetail(id);
    res.json(result);
  }
}

module.exports = MerchantController;
