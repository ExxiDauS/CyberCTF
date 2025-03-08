// db.ts
import mysql from 'mysql2/promise';
import process from 'process';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  port: parseInt(process.env.PORT || '3306'),
};

const pool = mysql.createPool(dbConfig);

pool.on('connection', (connection) => {
  connection.on('error', (err) => {
    console.error('Database connection error:', err);
  });
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Closing database pool...');
    await pool.end();
    console.log('Database pool closed.');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Closing database pool...');
    await pool.end();
    console.log('Database pool closed.');
    process.exit(0);
  });

export default pool;