import { useState, createContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// TODO: REMOVE
// import { doctors } from "../assets/assets_frontend/assets";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );
  const [userData, setUserData] = useState(false);

  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Add global axios interceptor for session expiry/multi-device login
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const msg =
          error?.response?.data?.message?.toLowerCase() || "";
        if (msg.includes("10 minutes") || msg.includes("locked")) {
          localStorage.removeItem("token");
          setToken(false);
          toast.error(
            "It has been 10 minutes, your account is locked. Please login again."
          );
          window.location.href = "/login";
        } else if (msg.includes("another device")) {
          localStorage.removeItem("token");
          setToken(false);
          toast.error(
            "You have been logged out because your account was accessed from another device."
          );
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: {
          token: token,
        },
      });

      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const value = {
    doctors,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  // Polling to check session validity every 1 minute
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(async () => {
      try {
        await axios.get(`${backendUrl}/api/user/get-profile`, {
          headers: { token }
        });
        // If session is valid, do nothing
      } catch (err) {
        // The axios interceptor will handle logout and token removal
      }
    }, 60000); // every 1 minute
    return () => clearInterval(interval);
  }, [token, backendUrl]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
