module.exports = {
    apps: [
      {
        name: "drps",
        script: "./server.js",
        watch: true,
        ignore_watch: ["node_modules", "logs"],
        env: {
          NODE_ENV: "development",
          PORT: 3000
        },
        env_production: {
          NODE_ENV: "production",
          PORT: 3000
        }
      }
    ]
  };
  