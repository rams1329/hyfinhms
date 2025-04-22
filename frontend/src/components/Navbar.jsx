import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

import { assets } from "../assets/assets_frontend/assets";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { token, setToken, userData, backendUrl } = useContext(AppContext);

  const [showMenu, setShowMenu] = useState(false);

  const logout = async () => {
    try {
      if (token) {
        await axios.post(`${backendUrl}/api/user/logout`, {}, {
          headers: { token }
        });
      }
    } catch (err) {
      // Optionally handle error
    }
    setToken(false);
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="w-28 cursor-pointer"
      />
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to={"/"}>
          <li className="py-1">HOME</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to={"/doctors"}>
          <li className="py-1">ALL DOCTORS</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to={"/about"}>
          <li className="py-1">ABOUT</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to={"/contact"}>
          <li className="py-1">CONTACT</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-4">
        {token && userData ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img src={userData.image} alt="" className="w-8 rounded-full" />
            <img src={assets.dropdown_icon} alt="" className="w-2.5" />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                <p
                  onClick={() => navigate("/my-profile")}
                  className="hover:text-black cursor-pointer"
                >
                  My Profile
                </p>
                <p
                  onClick={() => navigate("/my-appointments")}
                  className="hover:text-black cursor-pointer"
                >
                  My Appointments
                </p>
                <p onClick={logout} className="hover:text-black cursor-pointer">
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="text-primary border border-primary px-6 py-2.5 rounded-full font-light hidden md:block"
            >
              Login
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(new Event("showSignUp"));
                navigate("/login");
              }}
              className="bg-primary text-white px-6 py-2.5 rounded-full font-light hidden md:block"
            >
              Create account
            </button>
          </div>
        )}

        <img
          src={assets.menu_icon}
          onClick={() => setShowMenu(true)}
          alt=""
          className="w-6 md:hidden cursor-pointer"
        />

        {/* ---------------Mobile Menu--------------- */}
        <div
          className={`${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img src={assets.logo} alt="" className="w-28" />
            <img
              src={assets.cross_icon}
              onClick={() => setShowMenu(false)}
              alt=""
              className="w-7 cursor-pointer"
            />
          </div>

          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink to={"/"} onClick={() => setShowMenu(false)}>
              <p className="px-4 py-2 rounded inline-block">HOME</p>
            </NavLink>
            <NavLink to={"/doctors"} onClick={() => setShowMenu(false)}>
              <p className="px-4 py-2 rounded inline-block">ALL DOCTORS</p>
            </NavLink>
            <NavLink to={"/about"} onClick={() => setShowMenu(false)}>
              <p className="px-4 py-2 rounded inline-block">ABOUT</p>
            </NavLink>
            <NavLink to={"/contact"} onClick={() => setShowMenu(false)}>
              <p className="px-4 py-2 rounded inline-block">CONTACT</p>
            </NavLink>
            {!token && (
              <>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/login");
                  }}
                  className="text-primary border border-primary px-6 py-2.5 rounded-full font-light w-full mt-2"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    window.dispatchEvent(new Event("showSignUp"));
                    navigate("/login");
                  }}
                  className="bg-primary text-white px-6 py-2.5 rounded-full font-light w-full mt-2"
                >
                  Create account
                </button>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
