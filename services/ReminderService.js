const { query, execute } = require('../config/database');

class ReminderService {
  static async add(openid, reminderData) {
    try {
      const { foodName, expireTime, remindTime, foodType, remark } = reminderData;
      
      if (!foodName || !expireTime || !remindTime) {
        return { code: 400, msg: '缺少必填参数（食材名称/截止时间/提醒时间）', data: null };
      }
      if (remindTime < 1 || remindTime > 72) {
        return { code: 400, msg: '提前提醒时间需在1-72小时之间', data: null };
      }

      const expireDate = new Date(expireTime);
      if (isNaN(expireDate.getTime())) {
        return { code: 400, msg: '保质期截止时间格式错误，需为YYYY-MM-DD HH:MM', data: null };
      }
      if (expireDate < new Date()) {
        return { code: 400, msg: '保质期截止时间不能早于当前时间', data: null };
      }

      const reminderId = 'REM' + Date.now() + Math.floor(Math.random() * 1000);

      await execute(
        'INSERT INTO food_reminder (reminderId, openid, foodName, foodType, expireTime, remindTime, remark, status, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, "pending", NOW())',
        [reminderId, openid, foodName, foodType || '其他', expireTime, remindTime, remark || '']
      );

      this.setReminderTask(reminderId, expireDate, remindTime, openid, foodName);

      const reminder = await query('SELECT * FROM food_reminder WHERE reminderId = ?', [reminderId]);
      return {
        code: 200,
        msg: '食材提醒添加成功',
        data: reminder[0]
      };
    } catch (error) {
      console.error('添加食材提醒失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static async getList(openid, status = '') {
    try {
      let querySql = 'SELECT * FROM food_reminder WHERE openid = ?';
      const params = [openid];

      if (status && ['pending', 'triggered', 'expired'].includes(status)) {
        querySql += ' AND status = ?';
        params.push(status);
      }

      let reminders = await query(querySql, params);
      reminders.sort((a, b) => new Date(a.expireTime) - new Date(b.expireTime));

      const now = new Date();
      reminders.forEach(async reminder => {
        if (new Date(reminder.expireTime) < now && reminder.status !== 'expired') {
          await execute('UPDATE food_reminder SET status = "expired" WHERE reminderId = ?', [reminder.reminderId]);
          reminder.status = 'expired';
        }
      });

      return {
        code: 200,
        msg: '获取我的食材提醒成功',
        data: reminders
      };
    } catch (error) {
      console.error('获取食材提醒失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static async delete(openid, reminderId) {
    try {
      const reminder = await query('SELECT * FROM food_reminder WHERE reminderId = ? AND openid = ?', [reminderId, openid]);
      if (reminder.length === 0) {
        return { code: 404, msg: '食材提醒不存在或不属于当前用户', data: null };
      }

      await execute('DELETE FROM food_reminder WHERE reminderId = ? AND openid = ?', [reminderId, openid]);
      this.cancelReminderTask(reminderId);

      return { code: 200, msg: '食材提醒删除成功', data: null };
    } catch (error) {
      console.error('删除食材提醒失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static setReminderTask(reminderId, expireDate, remindTime, openid, foodName) {
    const now = new Date();
    const triggerTime = new Date(expireDate.getTime() - remindTime * 3600000);
    const delay = triggerTime - now;

    if (delay > 0) {
      setTimeout(async () => {
        console.log(`触发食材提醒: ${foodName} 即将过期`);
        await execute('UPDATE food_reminder SET status = "triggered" WHERE reminderId = ?', [reminderId]);
      }, delay);
    }
  }

  static cancelReminderTask(reminderId) {
    console.log(`取消食材提醒任务，提醒ID：${reminderId}`);
  }
}

module.exports = ReminderService;
