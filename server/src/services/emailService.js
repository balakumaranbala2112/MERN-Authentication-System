import transporter from "../config/nodemailer.js";
import config from "../config/env.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

export async function sendWelcomeEmail(user) {
  await transporter.sendMail({
    from: config.emailUser,
    to: user.email,
    subject: "Welcome to Our Platform",
    text: `Hello ${user.name}, welcome to our platform! Your account has been created successfully.`,
    html: `<p>Hello ${user.name},</p><p>Welcome to our platform! Your account has been created successfully.</p>`,
  });
}

export async function sendVerificationOtpEmail({ email, otp }) {
  await transporter.sendMail({
    from: config.emailUser,
    to: email,
    subject: "Verify Your Email",
    html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
      "{{email}}",
      email,
    ),
  });
}

export async function sendResetOtpEmail({ email, otp }) {
  await transporter.sendMail({
    from: config.emailUser,
    to: email,
    subject: "Password Reset OTP",
    html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
      "{{email}}",
      email,
    ),
  });
}
