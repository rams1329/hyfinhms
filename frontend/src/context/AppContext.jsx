import { useState, createContext, useEffect, useRef } from "react";
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
  const userActivityTimeoutRef = useRef(null);
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const resetUserActivityTimeout = () => {
    if (userActivityTimeoutRef.current) {
      clearTimeout(userActivityTimeoutRef.current);
    }
    if (token) {
      userActivityTimeoutRef.current = setTimeout(() => {
        logout();
        toast.info("You have been logged out due to inactivity");
      }, INACTIVITY_TIMEOUT);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post(
          `${backendUrl}/api/user/logout`,
          {},
          {
            headers: {
              token: token,
            },
          }
        );
      }
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(false);
      setUserData(false);
    }
  };

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
    logout,
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
      resetUserActivityTimeout();
      
      // Setup activity listeners
      const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
      const handleUserActivity = () => resetUserActivityTimeout();
      
      activityEvents.forEach(event => {
        window.addEventListener(event, handleUserActivity);
      });
      
      return () => {
        if (userActivityTimeoutRef.current) {
          clearTimeout(userActivityTimeoutRef.current);
        }
        activityEvents.forEach(event => {
          window.removeEventListener(event, handleUserActivity);
        });
      };
    } else {
      setUserData(false);
    }
  }, [token]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
