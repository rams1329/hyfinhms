import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  useEffect(() => {
    if (!isExpired || !expiryTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiryTime - now;
      if (diff <= 0) {
        setTimeLeft("Account is now active. Please try logging in again.");
        setIsExpired(false);
        setExpiryTime(null);
      } else {
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
        const days = Math.floor(diff / 1000 / 60 / 60 / 24);
        setTimeLeft(
          `${days > 0 ? days + 'd ' : ''}${hours > 0 ? hours + 'h ' : ''}${minutes}m remaining`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isExpired, expiryTime]);

  useEffect(() => {
    if (state === "Admin") {
      setEmail("admin@hymed.com");
      // setEmail("admin@prescripto.com");
      setPassword("qwerty123");
    } else {
      setEmail("richard@demo.com");
      setPassword("12345678");
    }
  }, [state]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (isExpired) return;
    try {
      if (state === "Admin") {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/doctor/login`, {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("dToken", data.token);
          setDToken(data.token);
          console.log(data.token);
        } else {
          toast.error(data.message);
          if (data.expired && data.expiresAt) {
            setIsExpired(true);
            setExpiryTime(new Date(data.expiresAt));
          }
        }
      }
    } catch (error) {}
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary">{state}</span> Login
        </p>
        {isExpired && (
          <div style={{ color: 'red', margin: '1em 0', fontWeight: 'bold' }}>
            Your account is temporarily suspended.<br />
            {timeLeft}
          </div>
        )}
        <div className="w-full">
          <p>Email</p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            disabled={isExpired}
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[#DADADA] rounded w-full p-2 mt-1 pr-10"
              disabled={isExpired}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button className="bg-primary text-white w-full py-2 rounded-md text-base" disabled={isExpired}>
          Login
        </button>
        {state === "Admin" ? (
          <p>
            Doctor Login?{" "}
            <span
              onClick={() => setState("Doctor")}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Admin Login?{" "}
            <span
              onClick={() => setState("Admin")}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
