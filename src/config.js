export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),

  // Scraper
  CHROMIUM_PATH: process.env.CHROMIUM_PATH || "",
  USER_AGENT:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  FINAL_PRICE_WARNING: 1550,
  DISCOUNT_PERCENTAGE_WARNING: 20,
  DISCOUNT_PRICE_WARNING: 1100,

  EXECUTION_PARALLEL: false,

  // Email
   email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    ssl: process.env.EMAIL_SSL === 'true',
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'super_secret_email_password',
  },

  // Store
  storePath: "./src/store.json",
};
