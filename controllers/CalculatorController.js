const CalculatorService = require('../services/CalculatorService');

class CalculatorController {
  static async compute(req, res) {
    const { openid } = req.headers;
    const params = req.body;
    const result = await CalculatorService.compute(params);
    res.json(result);
  }

  static async saveMerchantRule(req, res) {
    const { openid } = req.headers;
    const merchantData = req.body;
    const result = await CalculatorService.saveMerchantRule(openid, merchantData);
    res.json(result);
  }

  static async getMerchantRules(req, res) {
    const { openid } = req.headers;
    const result = await CalculatorService.getMerchantRules(openid);
    res.json(result);
  }
}

module.exports = CalculatorController;
