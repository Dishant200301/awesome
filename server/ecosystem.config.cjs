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
        NODE_ENV: "production",
        PORT: 5000,
        HOST: "127.0.0.1",
        DB_HOST: "localhost",
        DB_PORT: 3306,
        DB_NAME: "u382338879_awesome_hand",
        DB_USER: "u382338879_dishant1012",
        DB_PASSWORD: "Dishant@1012",
        JWT_ACCESS_SECRET: "super_secret_access_key",
        JWT_REFRESH_SECRET: "super_secret_refresh_key"
      },
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      time: true
    }
  ]
};
