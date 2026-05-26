const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Hz9855555',
  database: 'linpinggou',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const execute = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return result;
};

module.exports = { pool, query, execute };
