import { useContext, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const EmailVeirfy = () => {
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    const { backendUrl, isLoggedIn, userData, getUserData } = useContext(AppContext)

    const handleInput = (e, index) => {

        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key == "Backspace" && e.target.value === "" && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    }

    const handlePaste = (e) => {
        const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");

        pasteData.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
                // handleInput(e, index)
            }
        })
    }

    const onsubmitHandler = async (e) => {
        try {
            e.preventDefault();

            axios.defaults.withCredentials = true;

            const otpArray = inputRefs.current.map((input) => input.value).join("");

            console.log(otpArray);

            const { data } = await axios.post(backendUrl + "/api/v1/auth/verify-account", { otp: otpArray });

            if (data.success) {
                toast.success(data.message);
                getUserData();
                navigate("/");
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            if (error.response?.data?.message === "Account already verified") {
                getUserData();
                navigate("/");
            }
        }
    }

    useEffect(() => {
        if (isLoggedIn && userData && userData.isAccountVerified) {
            navigate("/")
        }
    }, [isLoggedIn, userData, navigate]);


    return (
        <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-linear-to-br from-blue-200 to-purple-400">
            <img onClick={() => navigate("/")} className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer" src={assets.logo} alt="Logo" />


            <form onSubmit={onsubmitHandler} className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm" action="">
                <h1 className="text-white text-2xl font-semibold text-center mb-4">Email Verify OTP</h1>
                <p className="text-center mb-6 text-indigo-300">Enter the 6-digit code sent your email address</p>

                <div className="flex justify-between mb-8" onPaste={handlePaste}>

                    {Array(6).fill(0).map((_, index) => (
                        <input ref={(e) => inputRefs.current[index] = e}
                            onInput={(e) => handleInput(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            type="text" maxLength="1" key={index} required
                            className="w-12 h-12 bg-[#333A5C] text-white text-center text-lg rounded-md"

                        />
                    ))}

                </div>

                <button type="submit" className="w-full py-3 rounded-md bg-linear-to-r from-indigo-500 to-indigo-900 cursor-pointer">Verify Email</button>
            </form>
        </div>
    )
}

export default EmailVeirfy;