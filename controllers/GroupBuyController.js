const GroupBuyService = require('../services/GroupBuyService');

class GroupBuyController {
  static async publish(req, res) {
    const { openid } = req.headers;
    const groupBuyData = req.body;
    const result = await GroupBuyService.publish(openid, groupBuyData);
    res.json(result);
  }

  static async join(req, res) {
    const { openid } = req.headers;
    const { groupBuyId } = req.body;
    const result = await GroupBuyService.join(openid, groupBuyId);
    res.json(result);
  }

  static async cancel(req, res) {
    const { openid } = req.headers;
    const { groupBuyId } = req.body;
    const result = await GroupBuyService.cancel(openid, groupBuyId);
    res.json(result);
  }

  static async getList(req, res) {
    const filters = req.query;
    const result = await GroupBuyService.getList(filters);
    res.json(result);
  }

  static async getDetail(req, res) {
    const { groupBuyId } = req.params;
    const result = await GroupBuyService.getDetail(groupBuyId);
    res.json(result);
  }

  static async getMyGroupBuys(req, res) {
    const { openid } = req.headers;
    const result = await GroupBuyService.getMyGroupBuys(openid);
    res.json(result);
  }
}

module.exports = GroupBuyController;
