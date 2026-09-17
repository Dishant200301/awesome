module.exports = {
  apps: [
    {
      name: "awesome-api",
      script: "./dist/server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: process.env.NODE_ENV || "production",
        PORT: process.env.PORT || 5000,
        HOST: process.env.HOST || "0.0.0.0",
        DB_HOST: process.env.DB_HOST || "localhost",
        DB_PORT: process.env.DB_PORT || 3306,
        DB_NAME: process.env.DB_NAME || "u382338879_awesome_hand",
        DB_USER: process.env.DB_USER || "u382338879_dishant1012",
        DB_PASSWORD: process.env.DB_PASSWORD || "",
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || ""
      },
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      time: true
    }
  ]
};
