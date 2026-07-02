import User from "../models/userModel.js";

export async function getUserData(req, res) {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        return res.status(200).json({
            success: true, message: "User data fetched successfully", userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
                email: user.email
            }
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }

}