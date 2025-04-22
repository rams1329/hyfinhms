import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";

const Navbar = () => {
  const { aToken, setAToken, appointments, getAllAppointments } = useContext(AdminContext);
  const { dToken, setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  // Track read/unread status by appointment ID
  const [readMap, setReadMap] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    // Fetch appointments if not already loaded
    if (aToken && appointments.length === 0) {
      getAllAppointments();
    }
  }, [aToken, appointments, getAllAppointments]);

  const logout = () => {
    navigate("/");
    aToken && setAToken("");
    aToken && localStorage.removeItem("aToken");
    dToken && setDToken("");
    dToken && localStorage.removeItem("dToken");
  };

  const unreadCount = appointments.filter((appt) => !readMap[appt._id]).length;

  const handleNotifClick = (appt) => {
    setSelectedNotif(appt);
    setReadMap((prev) => ({ ...prev, [appt._id]: true }));
    setShowDropdown(false);
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white relative">
      <div className="flex items-center gap-2 text-xs">
        <img
          src={assets.admin_logo}
          alt=""
          className="w-36 sm:w-40 cursor-pointer"
        />
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          {aToken ? "Admin" : "Doctor"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            className="relative p-2 rounded-full hover:bg-blue-50 focus:outline-none"
            onClick={() => setShowDropdown((v) => !v)}
            aria-label="Notifications"
          >
            {/* Bell SVG */}
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                  {unreadCount}
                </span>
              </>
            )}
          </button>
          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-blue-200 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-3 font-semibold text-blue-700 border-b">Notifications</div>
              {appointments.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">No notifications</div>
              ) : (
                appointments.map((appt) => (
                  <div
                    key={appt._id}
                    className={`flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-blue-50 ${!readMap[appt._id] ? "bg-blue-50/50" : ""}`}
                    onClick={() => handleNotifClick(appt)}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${readMap[appt._id] ? "bg-gray-300" : "bg-blue-500 animate-pulse"}`}></span>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">{appt.docData?.name || "Doctor"}</span>
                      <span className="mx-1 text-gray-400">→</span>
                      <span className="text-gray-600">{appt.userData?.name || "Patient"}</span>
                    </div>
                    {!readMap[appt._id] && <span className="text-xs text-blue-500 font-semibold ml-2">New</span>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="bg-primary text-white text-sm px-10 py-2 rounded-full"
        >
          Logout
        </button>
      </div>
      {/* Notification Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setSelectedNotif(null)}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="mb-2 text-lg font-semibold text-blue-700">Appointment Details</div>
            <div className="mb-1"><span className="font-medium">Doctor:</span> {selectedNotif.docData?.name || "Doctor"}</div>
            <div className="mb-1"><span className="font-medium">Doctor Email:</span> {selectedNotif.docData?.email || "-"}</div>
            <div className="mb-1"><span className="font-medium">Patient:</span> {selectedNotif.userData?.name || "Patient"}</div>
            <div className="mb-1"><span className="font-medium">Fees:</span> ₹{selectedNotif.amount}</div>
            <button
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all"
              onClick={() => setSelectedNotif(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
