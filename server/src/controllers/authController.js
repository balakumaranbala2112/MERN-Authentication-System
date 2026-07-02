import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js"

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

export async function sendVerifyOtp(req, res) {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "userId is required" })
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" })
        }

        if (user.isAccountVerified) {
            return res.status(400).json({ success: false, message: "Account already verified" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Verify Your Email",
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export async function verifyEmail(req, res) {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(401).json({ success: false, message: "userId and otp are required" })
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" })
        }

        if (user.isAccountVerified) {
            return res.status(400).json({ success: false, message: "Account already verified" });
        }

        if (user.verifyOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" })
        }

        if (user.verifyOtpExpiresAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP expired" })
        }

        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpiresAt = 0;

        await user.save();

        return res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export async function isAuthenticated(req, res) {
    try {
        return res.status(200).json({ success: true, message: "User is authenticated" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export async function sendResetOtp(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(401).json({ success: false, message: "email is required" })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset OTP",
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export async function resetPassword(req, res) {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(401).json({ success: false, message: "email, otp, newPassword are required" })
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" })
        }

        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.status(401).json({ success: false, message: "OTP is wrong" })
        }

        if (user.resetOtpExpiresAt < Date.now()) {
            return res.status(401).json({ success: false, message: "OTP is expired" })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpiresAt = 0;

        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}