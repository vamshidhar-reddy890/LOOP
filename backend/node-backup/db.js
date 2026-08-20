import pkg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'vamshi',
  database: process.env.DB_NAME || 'loop_app',
  ssl: false,
});

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();
export default pool;
