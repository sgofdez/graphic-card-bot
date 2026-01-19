const defaultConfig = {
  // Server
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),

  // Scraper
  CHROMIUM_PATH: process.env.CHROMIUM_PATH || "",
  USER_AGENT:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",

  EXECUTION_PARALLEL: process.env.EXECUTION_PARALLEL === "true",

  HEADLESS: process.env.HEADLESS === "true",

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

  // Links personalizados
  LINKS: [],
};

export async function getConfig() {
  let localConfig = {};
  try {
    const imported = await import('./items-config.js');
    localConfig = imported.localConfig || {};
  } catch (e) {
    // No hay config local, continuar con la config por defecto
  }
  return {
    ...defaultConfig,
    ...localConfig,
    LINKS: localConfig.LINKS || [],
  };
}
