const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * 환경별 데이터베이스 설정
 */
const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  // 프로덕션 환경: DATABASE_URL 사용
  if (env === 'production' && process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
      options: {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        pool: {
          max: 20,
          min: 2,
          acquire: 60000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true
        }
      }
    };
  }

  // 개발/테스트 환경: 개별 설정
  return {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: env === 'development' ? console.log : false,
      dialectOptions: {
        ssl: env === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    }
  };
};

/**
 * Sequelize 인스턴스 생성
 */
const createSequelizeInstance = () => {
  const config = getDatabaseConfig();

  if (config.url) {
    // 프로덕션: DATABASE_URL 사용
    return new Sequelize(config.url, config.options);
  } else {
    // 개발/테스트: 개별 설정 사용
    return new Sequelize(
      config.database,
      config.username,
      config.password,
      config.options
    );
  }
};

const sequelize = createSequelizeInstance();

/**
 * 데이터베이스 연결 테스트
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    const env = process.env.NODE_ENV || 'development';
    console.log(`✅ PostgreSQL 데이터베이스 연결 성공 (${env})`);

    // 개발 환경에서만 연결 정보 출력
    if (env === 'development') {
      console.log(`📍 DB: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
    }
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    process.exit(1);
  }
};

/**
 * 데이터베이스 연결 및 초기화
 */
const connectDB = async () => {
  try {
    // 1. 데이터베이스 연결 테스트
    await testConnection();

    // 2. 모델 초기화 (필요한 경우)
    const { initializeAssociations, syncDatabase } = require('../models');

    // 3. 모델 관계 설정
    initializeAssociations();

    // 4. 테이블 동기화
    // TODO: 프로덕션에서는 마이그레이션 도구 사용 권장
    await syncDatabase(false); // force: false로 기존 데이터 보존

    console.log('✅ 데이터베이스 연결 및 초기화 완료');

  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection,
  connectDB
};
