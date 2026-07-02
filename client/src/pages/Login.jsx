import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const Login = () => {

    const navigate = useNavigate();

    const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);

    const [state, setState] = useState("Sign Up");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onsubmitHandler = async (e) => {
        try {
            e.preventDefault();

            axios.defaults.withCredentials = true;

            if (state === "Sign Up") {
                const { data } = await axios.post(backendUrl + "/api/v1/auth/register", { name, email, password });

                if (data.success) {
                    getUserData();
                    setIsLoggedIn(true);
                    navigate("/")
                } else {
                    toast.error(data.message);
                }

            } else {
                const { data } = await axios.post(backendUrl + "/api/v1/auth/login", { email, password });

                if (data.success) {
                    setIsLoggedIn(true);
                    getUserData()
                    navigate("/");
                } else {
                    toast.error(data.message);
                }
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }

    }

    return (
        <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-linear-to-br from-blue-200 to-purple-400">

            <img onClick={() => navigate("/")} className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer" src={assets.logo} alt="Logo" />

            <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">

                <h2 className="text-3xl font-semibold text-white text-center mb-3" >{state === "Sign Up" ? "Create Account" : "Login"}</h2>

                <p className="text-center mb-6">{state === "Sign Up" ? "Create your Account" : "Login to your Account!"}</p>

                <form action="" onSubmit={onsubmitHandler}>
                    {state === "Sign Up" && (
                        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">

                            <img src={assets.person_icon} alt="" />

                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-transparent border-none outline-none text-white w-full " type="text" placeholder="Enter Name" required />
                        </div>
                    )}

                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">

                        <img src={assets.mail_icon} alt="" />

                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent border-none outline-none text-white w-full " type="email" placeholder="Enter Email" required />
                    </div>

                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">

                        <img src={assets.lock_icon} alt="" />

                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent border-none outline-none text-white w-full " type="password" placeholder="Enter Password" required />
                    </div>

                    <p onClick={() => navigate("/reset-password")} className="mb-4 text-left text-blue-500 cursor-pointer">Forget password ?</p>

                    <button type="submit" className="w-full py-2.5 rounded-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium cursor-pointer">{state}</button>
                </form>

                {state === "Sign Up" ? (<p className="text-center text-gray-400 text-sm mt-6">Already have an account? <span onClick={() => setState("Login")} className="text-blue-500 font-medium cursor-pointer underline">Login Here</span></p>
                ) : (<p className="text-center text-gray-400 text-sm mt-6">Dont't have an account? <span onClick={() => setState("Sign Up")} className="text-blue-500 font-medium cursor-pointer underline">Sign Up</span></p>)}

            </div>

        </div>
    )
}

export default Login;