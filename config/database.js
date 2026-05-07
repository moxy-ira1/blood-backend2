require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blood_bank_system',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME + '_test' || 'blood_bank_system_test',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: process.env.DB_USER || 'blood_postgress_user',
    password: process.env.DB_PASSWORD || 'FCFGQKpBcrfqTkt0uGAG3LZbxvK1m1UL',
    database: process.env.DB_NAME || 'blood_postgress',
    host: process.env.DB_HOST || 'dpg-d7tj7k9kh4rs73apt39g-a.oregon-postgres.render.com',
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  }
};
