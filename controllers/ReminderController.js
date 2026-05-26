const ReminderService = require('../services/ReminderService');

class ReminderController {
  static async add(req, res) {
    const { openid } = req.headers;
    const reminderData = req.body;
    const result = await ReminderService.add(openid, reminderData);
    res.json(result);
  }

  static async getList(req, res) {
    const { openid } = req.headers;
    const { status } = req.query;
    const result = await ReminderService.getList(openid, status);
    res.json(result);
  }

  static async delete(req, res) {
    const { openid } = req.headers;
    const { reminderId } = req.body;
    const result = await ReminderService.delete(openid, reminderId);
    res.json(result);
  }
}

module.exports = ReminderController;
