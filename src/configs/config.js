const config = {
  development: {
    corsOptions: { origin: process.env.CORS_ORIGINS, credentials: true },
    databaseURI: process.env.DEV_DATABASE_URL,
  },
  production: {
    corsOptions: {
      origin: process.env.CORS_ORIGINS, // Update this for production if needed
      credentials: true,
    },
    databaseURI: process.env.PROD_DATABASE_URL,
  },
};

module.exports = {
  config,
};
