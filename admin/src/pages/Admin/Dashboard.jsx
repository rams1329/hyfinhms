import React, { useContext, useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { aToken, dashData, getDashData, cancelAppointment, doctors, getAllDoctors, appointments, getAllAppointments } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);
  const [doctorStats, setDoctorStats] = useState([]);
  const [appointmentsByMonth, setAppointmentsByMonth] = useState([]);

  useEffect(() => {
    if (aToken) {
      getDashData();
      getAllDoctors();
      getAllAppointments();
    }
  }, [aToken]);

  // Process data for charts when appointments and doctors are loaded
  useEffect(() => {
    if (appointments.length > 0 && doctors.length > 0) {
      processAppointmentsByDoctor();
      processAppointmentsByMonth();
    }
  }, [appointments, doctors]);

  // Process appointments by doctor for the pie chart
  const processAppointmentsByDoctor = () => {
    const stats = [];
    
    doctors.forEach(doctor => {
      const doctorAppointments = appointments.filter(app => app.docId === doctor._id);
      const completedAppointments = doctorAppointments.filter(app => app.isCompleted).length;
      const cancelledAppointments = doctorAppointments.filter(app => app.cancelled).length;
      const pendingAppointments = doctorAppointments.filter(app => !app.isCompleted && !app.cancelled).length;
      
      stats.push({
        id: doctor._id,
        name: doctor.name,
        speciality: doctor.speciality,
        total: doctorAppointments.length,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        pending: pendingAppointments
      });
    });
    
    setDoctorStats(stats);
  };

  // Process appointments by month for the bar chart
  const processAppointmentsByMonth = () => {
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize all months
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = 0;
    }
    
    appointments.forEach(appointment => {
      if (appointment.slotDate) {
        const dateParts = appointment.slotDate.split('_');
        if (dateParts.length === 3) {
          const month = parseInt(dateParts[1]) - 1; // 0-indexed month
          const year = parseInt(dateParts[2]);
          
          if (year === currentYear) {
            monthlyData[month] = (monthlyData[month] || 0) + 1;
          }
        }
      }
    });
    
    setAppointmentsByMonth(monthlyData);
  };

  // Pie chart data
  const pieChartData = {
    labels: ['Completed', 'Cancelled', 'Pending'],
    datasets: [
      {
        data: [
          appointments.filter(app => app.isCompleted).length,
          appointments.filter(app => app.cancelled).length,
          appointments.filter(app => !app.isCompleted && !app.cancelled).length,
        ],
        backgroundColor: ['#4ade80', '#f87171', '#60a5fa'],
        borderColor: ['#22c55e', '#ef4444', '#3b82f6'],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data for monthly appointments
  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Appointments per Month',
        data: Object.values(appointmentsByMonth),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Doctor comparison chart data
  const doctorComparisonData = {
    labels: doctorStats.slice(0, 10).map(doc => doc.name),
    datasets: [
      {
        label: 'Total Appointments',
        data: doctorStats.slice(0, 10).map(doc => doc.total),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Completed',
        data: doctorStats.slice(0, 10).map(doc => doc.completed),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Cancelled',
        data: doctorStats.slice(0, 10).map(doc => doc.cancelled),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Doctor Performance Comparison',
      },
    },
  };

  return (
    dashData && (
      <div className="m-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img src={assets.doctor_icon} alt="" className="w-14" />
            <div>
              <p className="text-xl  font-semibold text-gray-600">
                {dashData.doctors}
              </p>
              <p className="text-gray-400">Doctors</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img src={assets.appointments_icon} alt="" className="w-14" />
            <div>
              <p className="text-xl  font-semibold text-gray-600">
                {dashData.appointments}
              </p>
              <p className="text-gray-400">Appointments</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img src={assets.patients_icon} alt="" className="w-14" />
            <div>
              <p className="text-xl  font-semibold text-gray-600">
                {dashData.patients}
              </p>
              <p className="text-gray-400">Patients</p>
            </div>
          </div>
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
          {/* Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Appointment Status Overview</h3>
            <div className="h-64">
              <Pie data={pieChartData} />
            </div>
          </div>
          
          {/* Bar Chart - Monthly Appointments */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Appointments</h3>
            <div className="h-64">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        
        {/* Doctor comparison chart - bar chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Doctor Performance</h3>
          <div className="h-80">
            <Bar data={doctorComparisonData} options={chartOptions} />
          </div>
        </div>
        
        {/* Doctor statistics table */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Doctor Statistics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Doctor</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Specialty</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Total</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Completed</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Cancelled</th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Pending</th>
                </tr>
              </thead>
              <tbody>
                {doctorStats.map((doctor, index) => (
                  <tr key={doctor.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-4 text-sm text-gray-700">{doctor.name}</td>
                    <td className="py-2 px-4 text-sm text-gray-700">{doctor.speciality}</td>
                    <td className="py-2 px-4 text-sm text-gray-700">{doctor.total}</td>
                    <td className="py-2 px-4 text-sm text-green-600">{doctor.completed}</td>
                    <td className="py-2 px-4 text-sm text-red-600">{doctor.cancelled}</td>
                    <td className="py-2 px-4 text-sm text-blue-600">{doctor.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white">
          <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
            <img src={assets.list_icon} alt="" />
            <p className="font-semibold">Latest Bookings</p>
          </div>

          <div className="pt-4 border border-t-0">
            {dashData.latestAppointments.map((item, index) => (
              <div
                key={index}
                className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100"
              >
                <img
                  src={item.docData.image}
                  alt=""
                  className="rounded-full w-10"
                />
                <div className="flex-1 text-sm">
                  <p className="text-gray-800 font-medium">
                    {item.docData.name}
                  </p>
                  <p className="text-gray-600">
                    {slotDateFormat(item.slotDate)}
                  </p>
                </div>

                {item.cancelled ? (
                  <p className="text-red-400 text-xs font-medium">Calcelled</p>
                ) : item.isCompleted ? (
                  <p className="text-green-400 text-xs font-medium">
                    Completed
                  </p>
                ) : (
                  <img
                    src={assets.cancel_icon}
                    alt=""
                    onClick={() => cancelAppointment(item._id)}
                    className="w-10 cursor-pointer"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default Dashboard;
