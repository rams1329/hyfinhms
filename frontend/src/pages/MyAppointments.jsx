import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import { AppContext } from "../context/AppContext";

const MyAppointments = () => {
  const navigate = useNavigate();
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`;
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: {
          token: token,
        },
      });

      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log(data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        {
          appointmentId,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response);
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/verify-razorpay`,
            response,
            {
              headers: {
                token: token,
              },
            }
          );
          if (data.success) {
            getUserAppointments();
            navigate("/my-appointments");
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-razorpay`,
        {
          appointmentId,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      if (data.success) {
        initPay(data.order);
      }
    } catch (error) {}
  };

  // Function to download appointments as Excel
  const downloadAsExcel = () => {
    if (appointments.length === 0) {
      toast.error("No appointments to download");
      return;
    }

    // Prepare the Excel data
    const excelData = appointments.map((appointment, index) => ({
      "No.": index + 1,
      "Doctor Name": appointment?.docData?.name || "N/A",
      "Specialty": appointment?.docData?.speciality || "N/A",
      "Date": appointment?.slotDate ? slotDateFormat(appointment.slotDate) : "N/A",
      "Time": appointment?.slotTime || "N/A",
      "Address": appointment?.docData?.address ? 
        `${appointment.docData.address.line1}, ${appointment.docData.address.line2}` : "N/A",
      "Status": appointment?.cancelled ? "Cancelled" : 
                appointment?.isCompleted ? "Completed" : 
                appointment?.payment ? "Paid" : "Payment Pending"
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");

    // Generate Excel file
    XLSX.writeFile(workbook, "my_appointments.xlsx");
    toast.success("Appointments downloaded as Excel");
  };

  // Function to download appointments as PDF
  const downloadAsPDF = () => {
    if (appointments.length === 0) {
      toast.error("No appointments to download");
      return;
    }

    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("My Appointments", 14, 15);
    
    // Prepare table data
    const tableData = appointments.map((appointment, index) => [
      index + 1,
      appointment?.docData?.name || "N/A",
      appointment?.docData?.speciality || "N/A",
      appointment?.slotDate ? slotDateFormat(appointment.slotDate) : "N/A",
      appointment?.slotTime || "N/A",
      appointment?.cancelled ? "Cancelled" : 
      appointment?.isCompleted ? "Completed" : 
      appointment?.payment ? "Paid" : "Payment Pending"
    ]);
    
    // Set column headers
    const headers = [["No.", "Doctor Name", "Specialty", "Date", "Time", "Status"]];
    
    // Generate table
    doc.autoTable({
      head: headers,
      body: tableData,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 255] }
    });
    
    // Save PDF
    doc.save("my_appointments.pdf");
    toast.success("Appointments downloaded as PDF");
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <div className="flex justify-between items-center pb-3 mt-12 border-b">
        <p className="font-medium text-zinc-700">My appointments</p>
        
        <div className="flex gap-2">
          <button 
            onClick={downloadAsExcel}
            className="text-sm bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-all duration-300"
          >
            Download as Excel
          </button>
          <button 
            onClick={downloadAsPDF}
            className="text-sm bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-all duration-300"
          >
            Download as PDF
          </button>
        </div>
      </div>
      <div>
        {appointments.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
          >
            <div>
              <img
                src={item?.docData?.image}
                alt=""
                className="w-32 bg-indigo-50"
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">
                {item?.docData?.name}
              </p>
              <p>{item?.docData?.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item?.docData?.address.line1}</p>
              <p className="text-xs">{item?.docData?.address.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:
                </span>{" "}
                {slotDateFormat(item?.slotDate)} | {item?.slotTime}
              </p>
            </div>

            <div></div>
            <div className="flex flex-col gap-2 justify-end">
              {!item.cancelled && item.payment && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50">
                  Paid
                </button>
              )}
              {item.cancelled !== true &&
                !item.payment &&
                !item.isCompleted && (
                  <button
                    onClick={() => appointmentRazorpay(item._id)}
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Pay here
                  </button>
                )}
              {item.cancelled !== true && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel appointment
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                  Appointment Cancelled
                </button>
              )}
              {item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">
                  Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
