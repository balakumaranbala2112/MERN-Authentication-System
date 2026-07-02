# MERN Authentication System: Bug Fixes & Refactoring Summary

This document summarizes all the issues you encountered while building the backend of your MERN Authentication System, why they were happening, and the before/after design of how we fixed them.

## 1. Environment Variables Not Loading

> [!WARNING]
> **The Error:** `MongoParseError: Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"`

**What went wrong:** You ran the server from inside the `server/` directory, but your `.env` file was sitting in the root directory. Because of this, `dotenv` couldn't find the file, leaving `process.env.MONGODB_URI` as `undefined`.

**The Fix (Architecture):**
- **Before:** `.env` was in `D:\PROJECTS\FULL STACK\MERN-Authentication-System\.env`
- **After:** Moved the `.env` file into `D:\PROJECTS\FULL STACK\MERN-Authentication-System\server\.env` so that `dotenv.config()` correctly scopes to the backend process.

---

## 2. MongoDB Namespace Error

> [!WARNING]
> **The Error:** `Invalid namespace specified: /mern-auth.users`

**What went wrong:** When connecting to Mongoose, you concatenated the database name to the URI string. Because your Atlas URI ended with a trailing slash (`/`), the resulting string had a double slash (`//mern-auth`), causing Mongoose to read the database name as `/mern-auth`.

**The Fix (Code):**
```diff
- await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`);
+ await mongoose.connect(process.env.MONGODB_URI, { dbName: "mern-auth" });
```

---

## 3. Missing Package Error (`bcrypt`)

> [!WARNING]
> **The Error:** `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'bcrypt'`

**What went wrong:** Your `package.json` had `bcryptjs` installed, but your controller was importing `bcrypt` (the native version). 

**The Fix (Code):**
```diff
- import bcrypt from "bcrypt";
+ import bcrypt from "bcryptjs";
```

---

## 4. Mongoose Schema Validation Failure

> [!WARNING]
> **The Error:** `User validation failed: password: Path 'password' is required.`

**What went wrong:** In your `register` controller, you created a new user document using the variable `hashedPassword`, but your Mongoose schema strictly expects the field to be named `password`. 

**The Fix (Code):**
```diff
- const user = new User({ name, email, hashedPassword });
+ const user = new User({ name, email, password: hashedPassword });
```

---

## 5. Bcrypt Comparison Failure on Login

> [!WARNING]
> **The Error:** `Illegal arguments: string, undefined` (from bcrypt.compare)

**What went wrong:** You updated your User model to include `select: false` on the password field to keep it secure. However, this means `User.findOne()` strips out the password by default, making `user.password` undefined when trying to verify the login attempt.

**The Fix (Code):**
```diff
- const user = await User.findOne({ email });
+ const user = await User.findOne({ email }).select('+password');
```

---

## 6. Nodemailer SSL Version Error

> [!WARNING]
> **The Error:** `SSL routines:tls_validate_record_header:wrong version number`

**What went wrong:** In your `.env` file, you had `EMAIL_SECURE=false`. However, environment variables are evaluated as strings in Node.js. The string `"false"` is a "truthy" value in JavaScript, which meant Nodemailer evaluated `secure: true`. This forced an immediate TLS connection on port 587 (which expects plain text STARTTLS instead), crashing the connection.

**The Fix (Code):**
```diff
- secure: process.env.EMAIL_SECURE,
+ secure: process.env.EMAIL_SECURE === "true",
```

---

## 7. Middleware Crash on Empty Request Bodies

> [!WARNING]
> **The Error:** `Cannot set properties of undefined (setting 'userId')`

**What went wrong:** In your `userAuth` middleware, you tried to append the decrypted `userId` to `req.body`. However, if the client sends a request without a JSON payload or missing the `Content-Type: application/json` header (which is common for OTP endpoints), `req.body` doesn't exist. 

**The Fix (Code):**
```diff
  if (decodedToken) {
+     req.body = req.body || {};
      req.body.userId = decodedToken.id;
  }
```

---

## 8. Password Reset Flow Logical Errors

> [!WARNING]
> **The Error:** "OTP is wrong" even when entering the correct OTP, and 401 Unauthorized errors on reset routes.

**What went wrong:** 
1. **Wrong Field:** When generating the "Forgot Password" OTP, your code was saving the token to `user.verifyOtp` instead of `user.resetOtp`.
2. **Blocked by Auth:** The `/send-reset-otp` and `/reset-password` routes were wrapped in the `userAuth` middleware. Since users who forgot their passwords aren't logged in, this blocked them from resetting their accounts.

**The Fix (Code):**
```diff
// In authController.js
- export async function sendResendOtp(req, res) {
+ export async function sendResetOtp(req, res) {
      ...
-     user.verifyOtp = otp;
-     user.verifyOtpExpiresAt = Date.now() + 15 * 60 * 1000;
+     user.resetOtp = otp;
+     user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;

// In authRoutes.js
- router.post("/send-resend-otp", userAuth, sendResendOtp);
- router.post("/reset-password", userAuth, resetPassword);
+ router.post("/send-reset-otp", sendResetOtp);
+ router.post("/reset-password", resetPassword);
```

---

## 9. API Catch-All Masking 404 Errors

> [!WARNING]
> **The Error:** Calling an invalid URL like `/send-resend-otp` returned a 200 OK with `"Hello MERN Auth API is working"`.

**What went wrong:** You used `app.use("/")` for your root endpoint. Because Express evaluates `app.use` as a global middleware for any path starting with `/`, it swallowed all 404 (Not Found) errors, making debugging harder because bad URLs returned success messages.

**The Fix (Code):**
```diff
- app.use("/", (req, res) => {
+ app.get("/", (req, res) => {
    res.status(200).json("Hello MERN Auth API is working");
  });

+ app.use((req, res) => {
+   res.status(404).json({ success: false, message: "API Route Not Found" });
+ });
```
