import dotenv from "dotenv";
dotenv.config();
export const config = {
    env: process.env.NODE_ENV || "production",
    port: parseInt(process.env.PORT || "5000", 10),
    db: {
        dialect: "mysql",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3306", 10),
        name: process.env.DB_NAME || "u382338879_awesome_hand",
        user: process.env.DB_USER || "u382338879_dishant1012",
        password: process.env.DB_PASSWORD || "Awesomehandmade@123",
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || "super_secret_access_key",
        refreshSecret: process.env.JWT_REFRESH_SECRET || "super_secret_refresh_key",
        accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "24h"),
        refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "24h"),
    },
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
    },
};
