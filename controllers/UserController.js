const UserService = require('../services/UserService');

class UserController {
  static async login(req, res) {
    const { nickname } = req.body;
    const result = await UserService.login(nickname);
    res.json(result);
  }

  static async getInfo(req, res) {
    const { openid } = req.headers;
    const result = await UserService.getInfo(openid);
    res.json(result);
  }

  static async updateInfo(req, res) {
    const { openid } = req.headers;
    const updateData = req.body;
    const result = await UserService.updateInfo(openid, updateData);
    res.json(result);
  }

  static async updateCredit(req, res) {
    const { openid } = req.headers;
    const { change } = req.body;
    const result = await UserService.updateCredit(openid, change);
    res.json(result);
  }
}

module.exports = UserController;
