const { query, execute } = require('../config/database');

class CalculatorService {
  static async compute(params) {
    try {
      const { minPrice, discountRules, selectedPrice, merchantType } = params;
      
      if (!minPrice || !discountRules || !selectedPrice || !merchantType) {
        return { code: 400, msg: '缺少必填参数', data: null };
      }

      const minPriceDiff = minPrice - selectedPrice;

      let discountRulesArray = discountRules;
      if (typeof discountRules === 'string') {
        try {
          discountRulesArray = JSON.parse(discountRules);
        } catch (e) {
          console.error('解析discountRules失败:', e);
          discountRulesArray = [];
        }
      } else if (Array.isArray(discountRules)) {
        discountRulesArray = discountRules;
      } else {
        discountRulesArray = [];
      }

      let bestDiscount = { full: minPrice, reduce: 0, diff: minPriceDiff > 0 ? minPriceDiff : 0 };

      discountRulesArray.forEach(rule => {
        const diff = rule.full - selectedPrice;
        if (diff < 0) return;

        const currentTotal = rule.full - rule.reduce;
        const bestTotal = bestDiscount.full - bestDiscount.reduce;

        if (currentTotal < bestTotal || 
            (currentTotal === bestTotal && diff < bestDiscount.diff)) {
          bestDiscount = { ...rule, diff };
        }
      });

      const recommendItems = this.getRecommendItems(merchantType);

      const singlePrice = minPriceDiff > 0 ? minPrice : selectedPrice;
      const groupPrice = bestDiscount.full - bestDiscount.reduce;
      const saveMoney = singlePrice - groupPrice;

      return {
        code: 200,
        msg: '凑单计算成功',
        data: {
          minPriceDiff,
          bestDiscount,
          recommendItems,
          priceCompare: { singlePrice, groupPrice, saveMoney }
        }
      };
    } catch (error) {
      console.error('凑单计算失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static getRecommendItems(merchantType) {
    switch (merchantType) {
      case 'takeout':
        return [
          { name: '矿泉水', price: 2 },
          { name: '纸巾', price: 3 },
          { name: '小菜', price: 5 },
          { name: '饮料', price: 4 },
          { name: '米饭', price: 2 }
        ];
      case 'fresh':
        return [
          { name: '鸡蛋', price: 4 },
          { name: '生抽', price: 8 },
          { name: '小葱', price: 1 },
          { name: '生姜', price: 3 },
          { name: '大蒜', price: 2 }
        ];
      case 'market':
        return [
          { name: '垃圾袋', price: 2 },
          { name: '牙膏', price: 6 },
          { name: '牙刷', price: 3 },
          { name: '毛巾', price: 5 },
          { name: '肥皂', price: 3 }
        ];
      default:
        return [];
    }
  }

  static async saveMerchantRule(openid, merchantData) {
    try {
      const { merchantName, minPrice, discountRules, merchantType } = merchantData;
      
      if (!merchantName || !minPrice || !discountRules || !merchantType) {
        return { code: 400, msg: '缺少必填参数', data: null };
      }

      const exist = await query('SELECT * FROM merchant_rule WHERE openid = ? AND merchantName = ?', [openid, merchantName]);
      
      if (exist.length > 0) {
        await execute(
          'UPDATE merchant_rule SET minPrice = ?, discountRules = ?, merchantType = ?, updateTime = NOW() WHERE openid = ? AND merchantName = ?',
          [minPrice, JSON.stringify(discountRules), merchantType, openid, merchantName]
        );
        return { code: 200, msg: '商家规则更新成功', data: merchantData };
      }

      await execute(
        'INSERT INTO merchant_rule (openid, merchantName, minPrice, discountRules, merchantType, createTime) VALUES (?, ?, ?, ?, ?, NOW())',
        [openid, merchantName, minPrice, JSON.stringify(discountRules), merchantType]
      );
      return { code: 200, msg: '商家规则保存成功', data: merchantData };
    } catch (error) {
      console.error('保存商家规则失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }

  static async getMerchantRules(openid) {
    try {
      const rules = await query('SELECT * FROM merchant_rule WHERE openid = ?', [openid]);
      return {
        code: 200,
        msg: '获取商家规则成功',
        data: rules.map(r => ({ ...r, discountRules: JSON.parse(r.discountRules) }))
      };
    } catch (error) {
      console.error('获取商家规则失败:', error);
      return { code: 500, msg: '服务器错误', data: null };
    }
  }
}

module.exports = CalculatorService;
