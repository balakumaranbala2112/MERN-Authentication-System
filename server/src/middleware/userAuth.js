import jwt from "jsonwebtoken"

async function userAuth(req, res, next) {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (decodedToken) {
            req.body = req.body || {};
            req.body.userId = decodedToken.id;
        } else {
            return res.status(401).json({ success: false, message: "Invalid Token" })
        }

        next();
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export default userAuth;