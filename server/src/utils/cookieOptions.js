import config from "../config/env.js";

const sevenDays = 7 * 24 * 60 * 60 * 1000;

export function getAuthCookieOptions() {
  const isProduction = config.nodeEnv === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction,
    maxAge: sevenDays,
  };
}

export function getClearAuthCookieOptions() {
  const isProduction = config.nodeEnv === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
  };
}
