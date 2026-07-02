import { assets } from "../assets/assets"
import { useContext } from "react"
import { AppContext } from "../context/AppContext"

const Header = () => {

    const { userData } = useContext(AppContext);

    return (
        <div className="flex flex-col items-center mt-20 px-4 text-center teaxt-gray-800">
            <img src={assets.header_img} alt=""
                className="w-36 h-36 rounded-full mb-6"
            />

            <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2" >Hey {userData ? userData.name : "Developers"} <img className="w-8 aspect-square" src={assets.hand_wave} alt="" /></h1>

            <h2 className="text-3xl sm:text-5xl font-semibold mb-4">Welcome to our App</h2>

            <p className="mb-8 max-w-md">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Similique necessitatibus repo unde nostrum excepturi quexpedita?</p>

            <button className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all cursor-pointer text-gray-700 font-medium">Get Started</button>
        </div>
    )
}

export default Header