import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import transporter from "../config/nodemailer.js";

export async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(401).json({ success: false, message: "All fields are required" })
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(401).json({ success: false, message: "Email already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" ? true : false, sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Welcome to Our Platform",
            text: `Hello ${user.name}, welcome to our platform! Your account has been created successfully.`,
            html: `<p>Hello ${user.name},</p><p>Welcome to our platform! Your account has been created successfully.</p>`
        }

        await transporter.sendMail(mailOptions);

        return res.status(201).json({ success: true, message: "User registered successfully", user });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({ success: false, message: "All fields are required" })
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" ? true : false, sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.status(200).json({ success: true, message: "User logged in successfully", user });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production" ? true : false, sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax" });

        return res.status(200).json({ success: true, message: "User logged out successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}
