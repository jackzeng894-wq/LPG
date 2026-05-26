const { query } = require('../config/database');
const { calculateDistance } = require('../utils/distanceCalculator');

class MerchantService {
  static async getList(openid, latitude, longitude, merchantType = '') {
    try {
      let querySql = 'SELECT * FROM merchant WHERE 1=1';
      const params = [];
      
      if (merchantType) {
        querySql += ' AND merchantType = ?';
        params.push(merchantType);
      }

      let merchants = await query(querySql, params);
      
      merchants = merchants.map(merchant => {
        const distance = calculateDistance(latitude, longitude, merchant.latitude, merchant.longitude);
        return {
          ...merchant,
          distance: Math.round(distance * 100) / 100,
          discountRules: JSON.parse(merchant.discountRules)
        };
      });

      merchants.sort((a, b) => a.distance - b.distance);

      return {
        code: 200,
        msg: '获取周边商家成功',
        data: merchants
      };
    } catch (error) {
      console.error('获取商家列表失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static async getDetail(merchantId) {
    try {
      const merchant = await query('SELECT * FROM merchant WHERE id = ?', [merchantId]);
      if (merchant.length === 0) {
        return { code: 404, msg: '商家不存在', data: null };
      }
      return {
        code: 200,
        msg: '获取商家详情成功',
        data: { ...merchant[0], discountRules: JSON.parse(merchant[0].discountRules) }
      };
    } catch (error) {
      console.error('获取商家详情失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }
}

module.exports = MerchantService;
