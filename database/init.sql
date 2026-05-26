CREATE DATABASE IF NOT EXISTS linpinggou CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE linpinggou;

CREATE TABLE IF NOT EXISTS user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) UNIQUE NOT NULL,
  nickname VARCHAR(50) DEFAULT 'default',
  avatarUrl VARCHAR(255),
  creditScore INT DEFAULT 100,
  creditLevel VARCHAR(20) DEFAULT 'good',
  location VARCHAR(200),
  notifyStatus TINYINT DEFAULT 1,
  createTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merchant (
  id INT PRIMARY KEY AUTO_INCREMENT,
  merchantName VARCHAR(100) NOT NULL,
  merchantType VARCHAR(20) NOT NULL,
  address VARCHAR(200),
  latitude DECIMAL(10,6) NOT NULL,
  longitude DECIMAL(10,6) NOT NULL,
  minPrice DECIMAL(10,2) NOT NULL,
  discountRules TEXT NOT NULL,
  deliveryFee DECIMAL(10,2) DEFAULT 0,
  createTime DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_buy (
  id INT PRIMARY KEY AUTO_INCREMENT,
  groupBuyId VARCHAR(50) UNIQUE NOT NULL,
  openid VARCHAR(100) NOT NULL,
  merchantName VARCHAR(100) NOT NULL,
  merchantType VARCHAR(20) NOT NULL,
  minPrice DECIMAL(10,2) NOT NULL,
  discountRules TEXT NOT NULL,
  orderTime DATETIME NOT NULL,
  maxPeople INT NOT NULL,
  currentPeople INT DEFAULT 1,
  shareAmount DECIMAL(10,2) NOT NULL,
  merchantImg VARCHAR(255),
  remark VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending',
  createTime DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_reminder (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reminderId VARCHAR(50) UNIQUE NOT NULL,
  openid VARCHAR(100) NOT NULL,
  foodName VARCHAR(100) NOT NULL,
  foodType VARCHAR(20) DEFAULT 'other',
  expireTime DATETIME NOT NULL,
  remindTime INT NOT NULL,
  remark VARCHAR(200),
  status VARCHAR(20) DEFAULT 'pending',
  createTime DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merchant_rule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) NOT NULL,
  merchantName VARCHAR(100) NOT NULL,
  minPrice DECIMAL(10,2) NOT NULL,
  discountRules TEXT NOT NULL,
  merchantType VARCHAR(20) NOT NULL,
  createTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_openid_merchantName (openid, merchantName)
);

CREATE TABLE IF NOT EXISTS group_buy_join (
  id INT PRIMARY KEY AUTO_INCREMENT,
  groupBuyId VARCHAR(50) NOT NULL,
  openid VARCHAR(100) NOT NULL,
  joinTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY idx_groupBuyId_openid (groupBuyId, openid)
);

CREATE TABLE IF NOT EXISTS chat_message (
  id INT PRIMARY KEY AUTO_INCREMENT,
  messageId VARCHAR(50) UNIQUE NOT NULL,
  groupBuyId VARCHAR(50) NOT NULL,
  senderOpenid VARCHAR(100) NOT NULL,
  receiverOpenid VARCHAR(100) NOT NULL,
  content VARCHAR(500) NOT NULL,
  sendTime DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO merchant (merchantName, merchantType, address, latitude, longitude, minPrice, discountRules, deliveryFee) VALUES
('delicious', 'takeout', 'Beijing', 39.9042, 116.4074, 30, '[{"full":30,"reduce":5},{"full":50,"reduce":12}]', 5),
('freshmart', 'fresh', 'Beijing', 39.9043, 116.4075, 50, '[{"full":50,"reduce":8},{"full":100,"reduce":20}]', 0),
('convenience', 'market', 'Beijing', 39.9044, 116.4076, 20, '[{"full":20,"reduce":3},{"full":40,"reduce":8}]', 3),
('sichuan', 'takeout', 'Beijing', 39.9045, 116.4077, 35, '[{"full":35,"reduce":6},{"full":60,"reduce":15}]', 6),
('vegetables', 'fresh', 'Beijing', 39.9046, 116.4078, 40, '[{"full":40,"reduce":5},{"full":80,"reduce":15}]', 2);
