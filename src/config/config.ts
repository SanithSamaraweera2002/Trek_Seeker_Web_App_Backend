import dotenv from 'dotenv';

dotenv.config();

export default {
  PORT: process.env.PORT || 3002,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || 'Admin@123',
  DB_NAME: process.env.DB_NAME || 'trekseeker_db',
};
