import "dotenv/config";

const requiredEnvVariables = ["MONGODB_URI", "JWT_SECRET", "EMAIL_USER"];

for (const key of requiredEnvVariables) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const parseList = (value, fallback = "") => {
  return (value || fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 4000,

  mongo: {
    mongoUri: process.env.MONGODB_URI,
    mongoDbName: process.env.MONGODB_DB_NAME || "mern-auth",
  },

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  emailUser: process.env.EMAIL_USER,

  clientOrigins: parseList(process.env.CLIENT_ORIGINS, "http://localhost:5173"),

  customDnsServers: parseList(process.env.DNS_SERVERS),
});

export default config;
