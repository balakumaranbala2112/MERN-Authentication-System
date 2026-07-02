import { useContext, useState, useRef } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [otp, setOtp] = useState(0);
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

    const inputRefs = useRef([]);
    const { backendUrl } = useContext(AppContext);

    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && e.target.value === "" && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    }

    const handlePaste = (e) => {
        const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");
        pasteData.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
            }
        })
    }

    const onSubmitEmail = async (e) => {
        e.preventDefault();
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + "/api/v1/auth/send-reset-otp", { email });
            if (data.success) {
                toast.success(data.message);
                setIsEmailSent(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }

    const onSubmitOTP = async (e) => {
        e.preventDefault();
        const otpArray = inputRefs.current.map((input) => input.value).join("");
        setOtp(otpArray);
        setIsOtpSubmitted(true);
    }

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + "/api/v1/auth/reset-password", { email, otp, newPassword });
            if (data.success) {
                toast.success(data.message);
                navigate("/login");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-linear-to-br from-blue-200 to-purple-400">
            <img onClick={() => navigate("/")} className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer" src={assets.logo} alt="Logo" />

            {/* Email Input Form */}
            {!isEmailSent && (
                <form onSubmit={onSubmitEmail} className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
                    <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password</h1>
                    <p className="text-center mb-6 text-indigo-300">Enter your registered email address</p>
                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                        <img src={assets.mail_icon} alt="" />
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent border-none outline-none text-white w-full"
                            type="email"
                            placeholder="Enter Email"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium cursor-pointer">Submit</button>
                </form>
            )}

            {/* OTP Input Form */}
            {!isOtpSubmitted && isEmailSent && (
                <form onSubmit={onSubmitOTP} className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
                    <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password OTP</h1>
                    <p className="text-center mb-6 text-indigo-300">Enter the 6-digit code sent to your email address</p>
                    <div className="flex justify-between mb-8" onPaste={handlePaste}>
                        {Array(6).fill(0).map((_, index) => (
                            <input
                                ref={(e) => inputRefs.current[index] = e}
                                onInput={(e) => handleInput(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                type="text"
                                maxLength="1"
                                key={index}
                                required
                                className="w-12 h-12 bg-[#333A5C] text-white text-center text-lg rounded-md"
                            />
                        ))}
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium cursor-pointer">Submit OTP</button>
                </form>
            )}

            {/* New Password Input Form */}
            {isOtpSubmitted && isEmailSent && (
                <form onSubmit={onSubmitNewPassword} className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
                    <h1 className="text-white text-2xl font-semibold text-center mb-4">New Password</h1>
                    <p className="text-center mb-6 text-indigo-300">Enter your new password below</p>
                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                        <img src={assets.lock_icon} alt="" />
                        <input
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-transparent border-none outline-none text-white w-full"
                            type="password"
                            placeholder="Enter New Password"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium cursor-pointer">Submit</button>
                </form>
            )}

        </div>
    )
}

export default ResetPassword;