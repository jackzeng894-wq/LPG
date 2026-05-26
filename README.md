# 邻拼购·周边商家凑单助手

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

一款轻量化网页应用工具，面向小区居民、上班族、高校学生，解决外卖、生鲜买菜、商超到家的凑单麻烦、强制消费、食物/金钱浪费等痛点。

## 🌟 项目亮点

- **智能凑单计算**：自动计算凑单差额，推荐最优满减方案和刚需凑单品
- **邻里拼单匹配**：基于LBS定位，优先匹配同小区/同楼栋拼友
- **商家信息聚合**：整合周边商家优惠信息，一键对比筛选
- **食材浪费提醒**：贴心的食材保质期管理，践行绿色低碳理念
- **信用体系保障**：拼单履约评分机制，提升社区信任度

## 📋 功能特性

### 核心功能
| 功能模块 | 描述 |
|---------|------|
| 智能凑单计算器 | 输入起送价、满减规则、已选商品价格，自动计算差额并推荐最优方案 |
| 周边商家聚合 | 基于定位展示附近外卖、生鲜、商超商家，标注起送价、满减、配送费 |
| 拼单广场 | 发布/参与拼单，支持按距离、时间、品类筛选匹配 |

### 辅助功能
| 功能模块 | 描述 |
|---------|------|
| 拼单信用体系 | 履约加分、违约扣分，展示信用等级 |
| 食材浪费提醒 | 设置食材保质期，到期自动提醒 |
| 基础设置 | 定位管理、消息通知、隐私设置 |

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                      网页前端 (Web)                         │
│  HTML5 + CSS3 + JavaScript + Bootstrap 5                   │
│  [首页] [凑单计算器] [拼单广场] [个人中心] [食材提醒]        │
└─────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Node.js 后端服务 (Express)                 │
│  [用户服务] [商家服务] [凑单计算] [拼单服务] [提醒服务]       │
└─────────────────────────────────────────────────────────────┘
                              │ MySQL
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MySQL 数据库                           │
│  users | merchants | groupbuys | reminders | credits       │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 前端 | HTML5 / CSS3 / JavaScript | - |
| 前端框架 | Bootstrap | 5.x |
| 后端 | Node.js | 18.x |
| 后端框架 | Express | 4.18.x |
| 数据库 | MySQL | 8.0.x |

## 📁 项目结构

```
LPG/
├── backend/                    # 后端服务
│   ├── config/                 # 配置文件
│   │   └── database.js         # 数据库配置
│   ├── controllers/            # 控制器层
│   │   ├── UserController.js
│   │   ├── CalculatorController.js
│   │   ├── MerchantController.js
│   │   ├── GroupBuyController.js
│   │   └── ReminderController.js
│   ├── services/               # 业务逻辑层
│   │   ├── UserService.js
│   │   ├── CalculatorService.js
│   │   ├── MerchantService.js
│   │   ├── GroupBuyService.js
│   │   └── ReminderService.js
│   ├── routes/                 # 路由配置
│   │   ├── user.js
│   │   ├── calculator.js
│   │   ├── merchant.js
│   │   ├── groupbuy.js
│   │   └── reminder.js
│   ├── database/               # 数据库脚本
│   │   └── init.sql
│   ├── utils/                  # 工具函数
│   │   └── distanceCalculator.js
│   ├── app.js                  # 应用入口
│   └── package.json            # 依赖配置
├── web/                        # 前端网页
│   ├── index.html             # 首页
│   └── app.js                 # 前端逻辑
├── requirement.md             # 需求文档
├── spec.md                    # 技术规格文档
├── api.md                     # API接口文档
├── test.md                    # 测试文档
├── report.md                  # 项目报告
└── README.md                  # 项目说明文档
```

## 🚀 快速开始

### 环境要求

- Node.js 18.x+
- MySQL 8.0.x+
- npm / yarn

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd LPG
   ```

2. **安装依赖**
   ```bash
   cd backend
   npm install
   ```

3. **配置数据库**
   - 创建MySQL数据库 `linpinggou`
   - 执行 `backend/database/init.sql` 初始化表结构
   - 修改 `backend/config/database.js` 配置数据库连接信息

4. **启动服务**
   ```bash
   # 开发模式
   npm run dev
   
   # 生产模式
   npm start
   ```

5. **访问应用**
   - 后端服务：http://localhost:3000
   - 前端页面：打开 `web/index.html`

## 🔌 API 接口

| 模块 | 接口 | 方法 | 描述 |
|------|------|------|------|
| 用户 | `/api/user/login` | POST | 用户注册/登录 |
| 用户 | `/api/user/info` | GET | 获取用户信息 |
| 用户 | `/api/user/update` | POST | 修改用户信息 |
| 凑单 | `/api/calculator/compute` | POST | 凑单计算 |
| 凑单 | `/api/calculator/saveMerchant` | POST | 保存常用商家 |
| 商家 | `/api/merchant/list` | GET | 获取周边商家列表 |
| 拼单 | `/api/groupbuy/publish` | POST | 发布拼单 |
| 拼单 | `/api/groupbuy/join` | POST | 参与拼单 |
| 拼单 | `/api/groupbuy/list` | GET | 获取拼单列表 |
| 拼单 | `/api/groupbuy/cancel` | POST | 取消拼单 |
| 提醒 | `/api/reminder/add` | POST | 添加食材提醒 |
| 提醒 | `/api/reminder/list` | GET | 获取提醒列表 |
| 提醒 | `/api/reminder/delete` | POST | 删除食材提醒 |

详细接口定义请参考 [api.md](./api.md)

## 🧪 测试

项目提供了完整的测试用例，覆盖5大核心模块：

```bash
# 使用 Postman 或 curl 测试接口
# 测试文档：test.md
```

测试覆盖情况：
- 用户模块：60% ✅
- 凑单计算器：17% ⚠️
- 商家模块：50% ⚠️
- 拼单模块：29% ⚠️
- 提醒模块：50% ⚠️

## 📝 文档清单

| 文档 | 描述 |
|------|------|
| [requirement.md](./requirement.md) | 需求文档（用户需求、功能需求、非功能需求） |
| [spec.md](./spec.md) | 技术规格文档（技术选型、架构设计、性能规格） |
| [api.md](./api.md) | API接口文档（接口定义、参数说明、响应格式） |
| [test.md](./test.md) | 测试文档（测试用例、测试流程、测试结果） |
| [report.md](./report.md) | 项目报告（研究背景、实施过程、测试验证） |


### 改进建议

1. **完善测试覆盖**：补充单元测试和集成测试，提高测试通过率
2. **增强异常处理**：完善参数校验和错误处理逻辑
3. **优化并发处理**：引入分布式锁或事务机制
4. **商家数据自动化**：开发商家信息自动抓取功能
5. **性能优化**：添加缓存机制，优化数据库查询

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**项目名称**：邻拼购·周边商家凑单助手  
**版本**：V1.0（MVP版本）  
**开发团队**：LinPingGou  
**完成日期**：2026年5月

---

*"少买、省钱、不浪费" - 让每一次消费都恰到好处*
