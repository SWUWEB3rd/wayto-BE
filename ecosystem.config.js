module.exports = {
  apps: [
    {
      name: "app-prod",
      script: "npm",
      args: "start",
      env: { NODE_ENV: "production", PORT: 3000 }
    },
    {
      name: "app-dev",
      script: "npm",
      args: "start",
      env: { NODE_ENV: "development", PORT: 4000, ENABLE_SWAGGER: "true" }
    }
  ]
}
