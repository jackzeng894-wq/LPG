const { query, execute } = require('../config/database');
const UserService = require('./UserService');

class GroupBuyService {
  static async publish(openid, groupBuyData) {
    try {
      const { merchantName, merchantType, minPrice, discountRules, orderTime, maxPeople, shareAmount, merchantImg, remark } = groupBuyData;
      
      if (!merchantName || !merchantType || !minPrice || !discountRules || !orderTime || !maxPeople || !shareAmount) {
        return { code: 400, msg: '缺少必填参数', data: null };
      }
      if (maxPeople < 2) {
        return { code: 400, msg: '拼单人数上限不能少于2人', data: null };
      }

      const user = await query('SELECT location FROM user WHERE openid = ?', [openid]);
      if (!user[0]?.location) {
        return { code: 400, msg: '请先设置常用定位地址', data: null };
      }

      const groupBuyId = 'GB' + Date.now() + Math.floor(Math.random() * 1000);

      await execute(
        'INSERT INTO group_buy (groupBuyId, openid, merchantName, merchantType, minPrice, discountRules, orderTime, maxPeople, currentPeople, shareAmount, merchantImg, remark, status, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, "pending", NOW())',
        [groupBuyId, openid, merchantName, merchantType, minPrice, JSON.stringify(discountRules), orderTime, maxPeople, shareAmount, merchantImg || '', remark || '']
      );

      const groupBuy = await query('SELECT * FROM group_buy WHERE groupBuyId = ?', [groupBuyId]);
      return {
        code: 200,
        msg: '拼单发布成功',
        data: { ...groupBuy[0], discountRules: JSON.parse(groupBuy[0].discountRules) }
      };
    } catch (error) {
      console.error('发布拼单失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static async join(openid, groupBuyId) {
    try {
      let groupBuy = await query('SELECT * FROM group_buy WHERE groupBuyId = ?', [groupBuyId]);
      if (groupBuy.length === 0) {
        return { code: 404, msg: '拼单不存在', data: null };
      }
      groupBuy = groupBuy[0];

      if (groupBuy.status !== 'pending' && groupBuy.status !== 'matching') {
        return { code: 400, msg: '该拼单已结束或已取消，无法参与', data: null };
      }
      if (groupBuy.currentPeople >= groupBuy.maxPeople) {
        return { code: 400, msg: '拼单人数已满，无法参与', data: null };
      }
      if (groupBuy.openid === openid) {
        return { code: 400, msg: '不能参与自己发布的拼单', data: null };
      }

      const isJoined = await query('SELECT * FROM group_buy_join WHERE groupBuyId = ? AND openid = ?', [groupBuyId, openid]);
      if (isJoined.length > 0) {
        return { code: 400, msg: '你已参与该拼单，无需重复参与', data: null };
      }

      const currentPeople = groupBuy.currentPeople + 1;
      const status = currentPeople === groupBuy.maxPeople ? 'matching' : groupBuy.status;

      await execute('UPDATE group_buy SET currentPeople = ?, status = ? WHERE groupBuyId = ?', [currentPeople, status, groupBuyId]);
      await execute('INSERT INTO group_buy_join (groupBuyId, openid, joinTime) VALUES (?, ?, NOW())', [groupBuyId, openid]);

      groupBuy = await query('SELECT * FROM group_buy WHERE groupBuyId = ?', [groupBuyId]);
      return {
        code: 200,
        msg: '参与拼单成功',
        data: { ...groupBuy[0], discountRules: JSON.parse(groupBuy[0].discountRules) }
      };
    } catch (error) {
      console.error('参与拼单失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static async cancel(openid, groupBuyId) {
    try {
      const groupBuy = await query('SELECT * FROM group_buy WHERE groupBuyId = ?', [groupBuyId]);
      if (groupBuy.length === 0) {
        return { code: 404, msg: '拼单不存在', data: null };
      }
      if (groupBuy[0].openid !== openid) {
        return { code: 401, msg: '无权限取消该拼单', data: null };
      }

      await execute('UPDATE group_buy SET status = "canceled" WHERE groupBuyId = ?', [groupBuyId]);
      return { code: 200, msg: '拼单取消成功', data: null };
    } catch (error) {
      console.error('取消拼单失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static async getList(filters = {}) {
    try {
      let querySql = 'SELECT * FROM group_buy WHERE status != "canceled"';
      const params = [];

      if (filters.status) {
        querySql += ' AND status = ?';
        params.push(filters.status);
      }
      if (filters.merchantType) {
        querySql += ' AND merchantType = ?';
        params.push(filters.merchantType);
      }

      let groupBuys = await query(querySql, params);
      groupBuys = groupBuys.map(g => ({ ...g, discountRules: JSON.parse(g.discountRules) }));
      
      groupBuys.sort((a, b) => new Date(a.createTime) - new Date(b.createTime));

      return {
        code: 200,
        msg: '获取拼单列表成功',
        data: groupBuys
      };
    } catch (error) {
      console.error('获取拼单列表失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static async getDetail(groupBuyId) {
    try {
      const groupBuy = await query('SELECT * FROM group_buy WHERE groupBuyId = ?', [groupBuyId]);
      if (groupBuy.length === 0) {
        return { code: 404, msg: '拼单不存在', data: null };
      }
      return {
        code: 200,
        msg: '获取拼单详情成功',
        data: { ...groupBuy[0], discountRules: JSON.parse(groupBuy[0].discountRules) }
      };
    } catch (error) {
      console.error('获取拼单详情失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static async getMyGroupBuys(openid) {
    try {
      const querySql = `
        SELECT gb.* FROM group_buy gb 
        WHERE gb.openid = ? OR gb.groupBuyId IN (
          SELECT groupBuyId FROM group_buy_join WHERE openid = ?
        )
        ORDER BY gb.createTime DESC
      `;
      let groupBuys = await query(querySql, [openid, openid]);
      groupBuys = groupBuys.map(g => ({ ...g, discountRules: JSON.parse(g.discountRules) }));
      
      return {
        code: 200,
        msg: '获取我的拼单成功',
        data: groupBuys
      };
    } catch (error) {
      console.error('获取我的拼单失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }
}

module.exports = GroupBuyService;
