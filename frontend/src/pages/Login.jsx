import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import PasswordInput from "../components/PasswordInput";
import ExpiryNotification from '../components/ExpiryNotification';

const Login = () => {
  const navigate = useNavigate();
  const { token, setToken, backendUrl } = useContext(AppContext);

  const [state, setState] = useState("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lockTimer, setLockTimer] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (state === "Login") {
      setEmail("");
      setPassword("");
      setShowOtpInput(false);
      setOtp("");
      setNewPassword("");
      setIsForgotPassword(false);
      setError(null);
      setLockTimer(null);
      setIsExpired(false);
    } else if (state === "Sign Up") {
      setEmail("");
      setPassword("");
      setName("");
      setOtp("");
      setNewPassword("");
      setShowOtpInput(false);
      setIsForgotPassword(false);
      setError(null);
      setLockTimer(null);
      setIsExpired(false);
    }
  }, [state]);

  // Listen for showSignUp event to switch to Sign Up mode
  useEffect(() => {
    const handler = () => setState("Sign Up");
    window.addEventListener("showSignUp", handler);
    return () => window.removeEventListener("showSignUp", handler);
  }, []);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  // Handle lock timer countdown
  useEffect(() => {
    let interval;
    if (lockTimer && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setError(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockTimer]);

  const handleStateChange = (newState) => {
    setState(newState);
    setError(null);
    setLockTimer(null);
    setShowOtpInput(false);
    setIsForgotPassword(false);
    setIsExpired(false);
    if (newState === "Sign Up") setLoginType('user');
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setIsExpired(false);

    try {
      if (state === "Sign Up" && !showOtpInput) {
        const { data } = await axios.post(`${backendUrl}/api/user/send-otp`, {
          name,
          email,
          password,
        });

        if (data.success) {
          toast.success(data.message);
          setShowOtpInput(true);
        } else {
          setError(data.message);
          toast.error(data.message);
        }
      } else if (state === "Sign Up" && showOtpInput) {
        const { data } = await axios.post(`${backendUrl}/api/user/verify-otp`, {
          email,
          otp,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success(data.message);
        } else {
          setError(data.message);
          toast.error(data.message);
        }
      } else if (state === "Login" && isForgotPassword && !showOtpInput) {
        const { data } = await axios.post(`${backendUrl}/api/user/forgot-password`, {
          email,
        });

        if (data.success) {
          toast.success(data.message);
          setShowOtpInput(true);
          setOtp("");
          setNewPassword("");
        } else {
          setError(data.message);
          toast.error(data.message);
        }
      } else if (state === "Login" && isForgotPassword && showOtpInput) {
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
          setState("Login");
        } else {
          setError(data.message);
          toast.error(data.message);
        }
      } else {
        const endpoint = `${backendUrl}/api/user/login`;
        const { data } = await axios.post(endpoint, {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Login successful");
        } else {
          // Handle different error scenarios
          if (data.expired) {
            setIsExpired(true);
            setError("Your account has expired. Please contact the administrator.");
          } else if (data.timeLeft) {
            setLockTimer(data.timeLeft * 60); // Convert minutes to seconds
            setError(data.message);
          } else if (data.attemptsLeft) {
            setError(`${data.message}. ${data.attemptsLeft} attempts remaining.`);
          } else {
            setError(data.message);
          }
          toast.error(data.message);
        }
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate password before proceeding
    if (!passwordRef.current?.validatePassword()) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${backendUrl}/api/user/signup`, {
        name,
        email,
        password,
      });

      if (data.success) {
        toast.success(data.message);
        setState("OTP");
        setOtpEmail(email);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
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

        {error && error.includes("expired") ? (
          <ExpiryNotification message={error} />
        ) : (
          error && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
              {lockTimer && (
                <div className="mt-1">
                  Account locked. Try again in {Math.floor(lockTimer / 60)}:
                  {(lockTimer % 60).toString().padStart(2, '0')} minutes.
                </div>
              )}
            </div>
          )
        )}

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
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showStrength={true}
            />
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
        {state === "Login" && !isForgotPassword && !showOtpInput && (
          <>
            <div className="w-full">
              <p>Email</p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                disabled={lockTimer > 0 || isExpired}
              />
            </div>
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showStrength={false}
              disabled={lockTimer > 0 || isExpired}
            />
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
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              showStrength={true}
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading || lockTimer > 0 || isExpired}
          className={`w-full py-2 rounded-md text-base ${
            loading || lockTimer > 0 || isExpired
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {loading
            ? "Please wait..."
            : state === "Sign Up"
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
                onClick={() => handleStateChange("Login")}
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
                onClick={() => handleStateChange("Sign Up")}
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
            {isExpired && (
              <div className="w-full p-3 mt-2 bg-blue-50 border border-blue-200 rounded-md text-blue-600">
                <p className="font-medium">Account Expired</p>
                <p className="text-sm mt-1">
                  Your account has expired. Please contact the administrator to reactivate your account.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </form>
  );
};

export default Login;