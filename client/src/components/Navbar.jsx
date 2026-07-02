import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
    const navigate = useNavigate();
    const { userData, backendUrl, setUserData, setIsLoggedIn } = useContext(AppContext);

    const sendVerifyOtp = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + "/api/v1/auth/send-verify-otp");

            if (data.success) {
                navigate("/email-verify")
                toast.success(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    const handleLogout = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + "/api/v1/auth/logout");

            data.success && setIsLoggedIn(false);
            data.success && setUserData(false);
            navigate("/")
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
            <img src={assets.logo} alt="Logo" className="w-28 sm:w-32" />

            {
                userData ? <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group cursor-pointer">
                    {userData.name[0].toUpperCase()}
                    <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
                        <ul className="py-3 list-none m-0 p-2 bg-gray-100 shadow-md rounded-md text-sm whitespace-nowrap">
                            {!userData.isAccountVerified && <li className="py-1.5 px-2 cursor-pointer hover:bg-gray-200 rounded" onClick={() => sendVerifyOtp()}>Verify email</li>}

                            <li onClick={handleLogout} className="py-1.5 px-2 cursor-pointer hover:bg-gray-200 rounded">Logout</li>
                        </ul>
                    </div>
                </div>

                    : <button onClick={() => navigate("/login")}
                        className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 cursor-pointer text-gray-800 hover:bg-gray-100" > Login <img src={assets.arrow_icon} alt="" /></button >
            }


        </div>
    )
}

export default Navbar;