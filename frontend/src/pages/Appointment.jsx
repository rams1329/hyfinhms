import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets_frontend/assets";
import RelatedDoctors from "../components/RelatedDoctors";

const Appointment = () => {
  const navigate = useNavigate();
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const fetchDocInfo = useCallback(async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    if (docInfo) {
    setDocInfo(docInfo);
      return true;
    }
    return false;
  }, [doctors, docId]);

  const getAvailableSlots = useCallback(async () => {
    if (!docInfo) return;
    
    setDocSlots([]);
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      // Set end time for the date with index
      let endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      // Ensure currentDate starts at a valid time (10 AM minimum)
      if (i === 0) {
        if (currentDate.getHours() >= 21) {
          // Skip current day if past 9 PM
          continue;
        }
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
        currentDate.setHours(Math.max(currentDate.getHours(), 10));
      } else {
        currentDate.setHours(10, 0, 0, 0);
      }

      let timeSlots = [];
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = `${day}_${month}_${year}`;
        const slotTime = formattedTime;

        const isSlotAvailable =
          docInfo.slots_booked[slotDate] &&
          docInfo.slots_booked[slotDate].includes(slotTime)
            ? false
            : true;

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        // Increment current time by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      if (timeSlots.length > 0) {
        setDocSlots((prev) => [...prev, timeSlots]);
      }
    }
  }, [docInfo]);

  // Setup periodic refresh of doctor info and slots
  useEffect(() => {
    const refreshData = async () => {
      const success = await fetchDocInfo();
      if (success) {
        await getAvailableSlots();
      }
    };

    // Initial fetch
    refreshData();

    // Set up interval for periodic refresh (every 10 seconds)
    const interval = setInterval(refreshData, 10000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [fetchDocInfo, getAvailableSlots]);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    await getDoctorsData();
    await fetchDocInfo();
    await getAvailableSlots();
    toast.info("Slots refreshed");
  };

  // Reset slot selection when slots change
  useEffect(() => {
    if (docSlots.length > 0 && (!docSlots[slotIndex] || docSlots[slotIndex].length === 0)) {
      setSlotIndex(0);
      setSlotTime("");
    }
  }, [docSlots, slotIndex]);

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }

    if (!slotTime) {
      toast.warn("Please select a time slot");
      return;
    }

    try {
      setIsBooking(true);
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = `${day}_${month}_${year}`;

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        {
          docId,
          slotDate,
          slotTime,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        // Refresh doctor data and slots before navigating
        await getDoctorsData();
        await fetchDocInfo();
        await getAvailableSlots();
        navigate("/my-appointments");
      } else {
        if (data.message.includes("already booked") || data.message.includes("not available")) {
          toast.error("This slot was just booked by someone else. Please select another slot.");
          // Refresh available slots immediately
          await getDoctorsData();
          await fetchDocInfo();
          await getAvailableSlots();
          setSlotTime("");
      } else {
        toast.error(data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    docInfo && (
      <div>
        {/* --------------------Doctor Details-------------------- */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              src={docInfo?.image}
              alt=""
              className="bg-primary w-full sm:max-w-72 rounded-lg"
            />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            {/* -----Doc Info: name, degree, experience----- */}
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo?.name}{" "}
              <img src={assets.verified_icon} alt="" className="w-5" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
  <p>
    {docInfo?.degree?.name || docInfo?.degree} - {docInfo?.speciality}
  </p>
  <p className="py-0.5 px-2 border text-xs rounded-full">
    {docInfo?.experience}
  </p>
</div>


            {/* -----Doctor About----- */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" className="w-3.5" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo?.about}
              </p>
            </div>

            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo?.fees}
              </span>{" "}
            </p>
          </div>
        </div>

        {/* -----Booking Slots----- */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <div className="flex items-center gap-4 mb-2">
          <p>Booking slots</p>
            <button
              onClick={handleManualRefresh}
              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all"
            >
              Refresh Slots
            </button>
          </div>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length > 0 ? (
              docSlots.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSlotIndex(index);
                    setSlotTime("");
                  }}
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                    slotIndex === index
                      ? "bg-primary text-white"
                      : "border border-gray-200"
                  } `}
                >
                  <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                  <p>{item[0] && item[0].datetime.getDate()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No available slots</p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
            {docSlots.length > 0 && docSlots[slotIndex]?.map((item, index) => (
                <p
                  key={index}
                  onClick={() => setSlotTime(item.time)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                    item.time === slotTime
                      ? "bg-primary text-white"
                      : "text-gray-500 border border-gray-300"
                  }`}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>

          <button
            onClick={bookAppointment}
            disabled={isBooking || !slotTime}
            className={`bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6 ${
              (isBooking || !slotTime) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'
            }`}
          >
            {isBooking ? "Booking..." : "Book an appointment"}
          </button>
        </div>

        {/* Listing Related Doctors */}
        <RelatedDoctors docId={docId} speciality={docInfo?.speciality} />
      </div>
    )
  );
};

export default Appointment;