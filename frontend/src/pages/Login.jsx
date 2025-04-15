import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { token, setToken, backendUrl } = useContext(AppContext);

  const [state, setState] = useState(localStorage.getItem("loginState") || "Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    if (state === "Login") {
      setEmail("testuser@prescripto.com");
      setPassword("12345678");
      setShowOtpInput(false);
      setOtp("");
      setNewPassword("");
      setIsForgotPassword(false);
    } else if (state === "Sign Up") {
      setEmail("");
      setPassword("");
      setName("");
      setOtp("");
      setNewPassword("");
      setShowOtpInput(false);
      setIsForgotPassword(false);
    }
  }, [state]);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  // Check password strength
  useEffect(() => {
    if (state === "Sign Up" || (state === "Login" && isForgotPassword && showOtpInput)) {
      const passwordToCheck = state === "Sign Up" ? password : newPassword;
      setPasswordStrength({
        length: passwordToCheck.length >= 8,
        uppercase: /[A-Z]/.test(passwordToCheck),
        number: /[0-9]/.test(passwordToCheck),
        special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordToCheck)
      });
    }
  }, [password, newPassword, state, isForgotPassword, showOtpInput]);

  // Calculate overall password strength
  const getPasswordStrengthPercentage = () => {
    const { length, uppercase, number, special } = passwordStrength;
    const totalCriteria = 4;
    const metCriteria = [length, uppercase, number, special].filter(Boolean).length;
    return (metCriteria / totalCriteria) * 100;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === "Sign Up" && !showOtpInput) {
        // Check password strength before submission
        const { length, uppercase, number, special } = passwordStrength;
        if (!length || !uppercase || !number || !special) {
          toast.error("Password doesn't meet the required strength criteria");
          return;
        }

        // Send OTP request for sign up
        const { data } = await axios.post(`${backendUrl}/api/user/send-otp`, {
          name,
          email,
          password,
        });

        if (data.success) {
          toast.success(data.message);
          setShowOtpInput(true);
        } else {
          toast.error(data.message);
        }
      } else if (state === "Sign Up" && showOtpInput) {
        // Verify OTP for sign up
        const { data } = await axios.post(`${backendUrl}/api/user/verify-otp`, {
          email,
          otp,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } else if (state === "Login" && isForgotPassword && !showOtpInput) {
        // Send OTP for forgot password
        const { data } = await axios.post(`${backendUrl}/api/user/forgot-password`, {
          email,
        });

        if (data.success) {
          toast.success(data.message);
          setShowOtpInput(true);
        } else {
          toast.error(data.message);
        }
      } else if (state === "Login" && isForgotPassword && showOtpInput) {
        // Check password strength before submission
        const { length, uppercase, number, special } = passwordStrength;
        if (!length || !uppercase || !number || !special) {
          toast.error("New password doesn't meet the required strength criteria");
          return;
        }

        // Reset password
        const { data } = await axios.post(`${backendUrl}/api/user/reset-password`, {
          email,
          otp,
          newPassword,
        });

        if (data.success) {
          toast.success(data.message);
          setIsForgotPassword(false);
          setShowOtpInput(false);
          setNewPassword("");
          setOtp("");
        } else {
          toast.error(data.message);
        }
      } else {
        // Login
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Login successful");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === "Sign Up"
            ? showOtpInput
              ? "Verify OTP"
              : "Create Account"
            : isForgotPassword
            ? showOtpInput
              ? "Reset Password"
              : "Forgot Password"
            : "Login"}
        </p>
        <p>
          {state === "Sign Up"
            ? showOtpInput
              ? "Enter the OTP sent to your email"
              : "Please sign up to book appointment"
            : isForgotPassword
            ? showOtpInput
              ? "Enter OTP and new password"
              : "Enter your email to reset password"
            : "Please login to book appointment"}
        </p>
        {state === "Sign Up" && !showOtpInput && (
          <>
            <div className="w-full">
              <p>Full Name</p>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-zinc-300 rounded w-full p-2 mt-1"
              />
            </div>
            <div className="w-full">
              <p>Email</p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-zinc-300 rounded w-full p-2 mt-1"
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
                  className="border border-zinc-300 rounded w-full p-2 mt-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {/* Password strength meter */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      getPasswordStrengthPercentage() <= 25 ? 'bg-red-500' :
                      getPasswordStrengthPercentage() <= 50 ? 'bg-orange-500' :
                      getPasswordStrengthPercentage() <= 75 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${getPasswordStrengthPercentage()}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-1">
                  <p className={passwordStrength.length ? 'text-green-500' : 'text-red-500'}>
                    ✓ Minimum 8 characters
                  </p>
                  <p className={passwordStrength.uppercase ? 'text-green-500' : 'text-red-500'}>
                    ✓ At least 1 uppercase letter
                  </p>
                  <p className={passwordStrength.number ? 'text-green-500' : 'text-red-500'}>
                    ✓ At least 1 number
                  </p>
                  <p className={passwordStrength.special ? 'text-green-500' : 'text-red-500'}>
                    ✓ At least 1 special character
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        {state === "Sign Up" && showOtpInput && (
          <div className="w-full">
            <p>OTP</p>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              placeholder="Enter 6-digit OTP"
            />
          </div>
        )}
        {state === "Login" && !isForgotPassword && (
          <>
            <div className="w-full">
              <p>Email</p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-zinc-300 rounded w-full p-2 mt-1"
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
                  className="border border-zinc-300 rounded w-full p-2 mt-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </>
        )}
        {state === "Login" && isForgotPassword && !showOtpInput && (
          <div className="w-full">
            <p>Email</p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-zinc-300 rounded w-full p-2 mt-1"
            />
          </div>
        )}
        {state === "Login" && isForgotPassword && showOtpInput && (
          <>
            <div className="w-full">
              <p>OTP</p>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <div className="w-full">
              <p>New Password</p>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border border-zinc-300 rounded w-full p-2 mt-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
              {/* Password strength meter for reset password */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      getPasswordStrengthPercentage() <= 25 ? 'bg-red-500' :
                      getPasswordStrengthPercentage() <= 50 ? 'bg-orange-500' :
                      getPasswordStrengthPercentage() <= 75 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${getPasswordStrengthPercentage()}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-1">
                  <p className={passwordStrength.length ? 'text-green-500' : 'text-red-500'}>
                    ✓ Minimum 8 characters
                  </p>
                  <p className={passwordStrength.uppercase ? 'text-green-500' : 'text-red-500'}>
                    ✓ At least 1 uppercase letter
                  </p>
                  <p className={passwordStrength.number ? 'text-green-500' : 'text-red-500'}>
                    ✓ At least 1 number
                  </p>
                  <p className={passwordStrength.special ? 'text-green-500' : 'text-red-500'}>
                    ✓ At least 1 special character
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md text-base"
        >
          {state === "Sign Up"
            ? showOtpInput
              ? "Verify OTP"
              : "Create Account"
            : isForgotPassword
            ? showOtpInput
              ? "Reset Password"
              : "Send OTP"
            : "Login"}
        </button>

        {state === "Sign Up" ? (
          showOtpInput ? (
            <p>
              Back to sign up?{" "}
              <span
                onClick={() => setShowOtpInput(false)}
                className="text-primary underline cursor-pointer"
              >
                Click here
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-primary underline cursor-pointer"
              >
                Login here
              </span>
            </p>
          )
        ) : isForgotPassword ? (
          <p>
            Back to login?{" "}
            <span
              onClick={() => setIsForgotPassword(false)}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </p>
        ) : (
          <>
            <p>
              Create a new account?{" "}
              <span
                onClick={() => setState("Sign Up")}
                className="text-primary underline cursor-pointer"
              >
                Click here
              </span>
            </p>
            <p>
              Forgot password?{" "}
              <span
                onClick={() => setIsForgotPassword(true)}
                className="text-primary underline cursor-pointer"
              >
                Click here
              </span>
            </p>
          </>
        )}
      </div>
    </form>
  );
};

export default Login;