import jwt from "jsonwebtoken";

async function protect(req, res, next) {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decodedToken = jwt.verify(token, config.jwtSecret);

    if (decodedToken) {
      req.user = req.user || {};
      req.user.id = decodedToken.id;
    } else {
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    next();
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

export default protect;
