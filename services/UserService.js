const { query, execute } = require('../config/database');

class UserService {
  static async login(nickname = '') {
    try {
      const defaultNickname = nickname || '用户' + Date.now().toString().slice(-4);
      const openid = 'user_' + Date.now() + Math.floor(Math.random() * 1000);
      
      const existingUser = await query('SELECT * FROM user WHERE nickname = ?', [defaultNickname]);
      if (existingUser.length > 0) {
        return {
          code: 200,
          msg: '登录成功',
          data: {
            openid: existingUser[0].openid,
            nickname: existingUser[0].nickname || '默认昵称',
            avatarUrl: existingUser[0].avatarUrl || '',
            creditScore: existingUser[0].creditScore,
            location: existingUser[0].location || '',
            notifyStatus: existingUser[0].notifyStatus || 1
          }
        };
      }
      
      await execute('INSERT INTO user (openid, nickname, creditScore, creditLevel, createTime) VALUES (?, ?, 100, "优秀", NOW())', [openid, defaultNickname]);
      return {
        code: 200,
        msg: '登录成功，新用户已创建',
        data: { openid, nickname: defaultNickname, avatarUrl: '', creditScore: 100 }
      };
    } catch (error) {
      console.error('用户登录失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static async getInfo(openid) {
    try {
      const user = await query('SELECT openid, nickname, avatarUrl, creditScore, creditLevel, location, notifyStatus FROM user WHERE openid = ?', [openid]);
      if (user.length === 0) {
        return { code: 404, msg: '用户不存在', data: null };
      }
      return {
        code: 200,
        msg: '获取用户信息成功',
        data: user[0]
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static async updateInfo(openid, updateData) {
    try {
      const { nickname, avatarUrl, location } = updateData;
      if (!nickname && !avatarUrl && !location) {
        return { code: 400, msg: '请至少修改一项信息', data: null };
      }

      let updateSql = 'UPDATE user SET ';
      const params = [];
      if (nickname) {
        updateSql += 'nickname = ?, ';
        params.push(nickname);
      }
      if (avatarUrl) {
        updateSql += 'avatarUrl = ?, ';
        params.push(avatarUrl);
      }
      if (location) {
        updateSql += 'location = ?, ';
        params.push(location);
      }
      updateSql = updateSql.slice(0, -2) + ' WHERE openid = ?';
      params.push(openid);

      await execute(updateSql, params);
      return this.getInfo(openid);
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static async updateCredit(openid, change) {
    try {
      const user = await query('SELECT creditScore FROM user WHERE openid = ?', [openid]);
      if (user.length === 0) {
        return { code: 404, msg: '用户不存在', data: null };
      }
      let newScore = user[0].creditScore + change;
      newScore = Math.max(0, Math.min(150, newScore));
      
      let level = '优秀';
      if (newScore >= 100) level = '优秀';
      else if (newScore >= 80) level = '良好';
      else if (newScore >= 60) level = '一般';
      else level = '较差';

      await execute('UPDATE user SET creditScore = ?, creditLevel = ? WHERE openid = ?', [newScore, level, openid]);
      return { code: 200, msg: '信用分更新成功', data: { creditScore: newScore, creditLevel: level } };
    } catch (error) {
      console.error('更新信用分失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }
}

module.exports = UserService;
