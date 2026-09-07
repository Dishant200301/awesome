import { Sequelize } from "sequelize";
import { config } from "../config/index.js";
import { initializeMySQLDatabase } from "./init_db.js";

// MySQL Sequelize Instance
export const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export let isMySQLConnected = false;

export const connectDB = async () => {
  try {
    // 1. Ensure DB & tables exist via auto-initializer
    await initializeMySQLDatabase();

    // 2. Authenticate Sequelize
    await sequelize.authenticate();
    isMySQLConnected = true;
    console.log(`✅ MySQL Database '${config.db.name}' connected successfully.`);
  } catch (error) {
    isMySQLConnected = false;
    console.error("❌ MySQL Database connection failed:", (error as Error).message);
  }
};
