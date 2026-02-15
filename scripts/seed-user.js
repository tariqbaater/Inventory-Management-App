import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('Usage: node scripts/seed-user.js <username> <password>');
  process.exit(1);
}

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || 'inventory-management-dukandb-i41rfq',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

await connection.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) NOT NULL DEFAULT 0,
    store_id VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

const hash = await bcrypt.hash(password, 12);
await connection.execute(
  'INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_admin = 1',
  [username, hash]
);

console.log(`User "${username}" created/updated successfully.`);
await connection.end();
