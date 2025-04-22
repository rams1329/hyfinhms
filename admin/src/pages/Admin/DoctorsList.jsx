import React, { useContext, useEffect, useState } from "react";

import { AdminContext } from "../../context/AdminContext";

const DoctorsList = () => {
  const { doctors, getAllDoctors, aToken, changeAvailability, promoteDoctor, demoteDoctor } =
    useContext(AdminContext);
  
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 8;
  
  // Get unique specialties for filter dropdown
  const specialties = doctors ? ["all", ...new Set(doctors.map(doc => doc.speciality))] : ["all"];

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);
  
  useEffect(() => {
    applyFilters();
  }, [doctors, searchTerm, sortOption, specialtyFilter]);
  
  const applyFilters = () => {
    if (!doctors) return;
    
    let filtered = [...doctors];
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) => 
          doc.name.toLowerCase().includes(lowercasedSearch) || 
          doc.speciality.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply specialty filter
    if (specialtyFilter !== "all") {
      filtered = filtered.filter(doc => doc.speciality === specialtyFilter);
    }
    
    // Apply sorting
    if (sortOption === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === "availability") {
      filtered.sort((a, b) => (b.available === a.available ? 0 : b.available ? -1 : 1));
    }
    
    setFilteredDoctors(filtered);
  };
  
  // Pagination logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="m-5 overflow-hidden">
      <h1 className="text-lg font-medium">All Doctors</h1>
      
      {/* Search, Filter and Sort Controls */}
      <div className="my-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {specialties.map((specialty, index) => (
              <option key={index} value={specialty}>
                {specialty === "all" ? "All Specialties" : specialty}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="default">Default Sort</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="availability">By Availability</option>
          </select>
        </div>
      </div>
      
      {/* Results count */}
      <p className="text-sm text-gray-600 mb-3">
        {filteredDoctors.length} doctors found
      </p>
      
      {/* Doctors list */}
      <div className="w-full max-h-[65vh] overflow-y-auto">
        <div className="w-full flex flex-wrap gap-4 pt-2 gap-y-6">
          {currentDoctors?.map((item, index) => (
            <div
              key={index}
              className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            >
              <img
                src={item.image}
                alt=""
                className="bg-indigo-50 group-hover:bg-primary transition-all duration-500"
              />
              <div className="p-4">
                <p className="text-neutral-800 text-lg font-medium">
                  {item.name}
                </p>
                <p className="text-zinc-600 text-sm">{item.speciality}</p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={() => changeAvailability(item._id)}
                    className="cursor-pointer"
                  />
                  <p>Available</p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${item.role === 'admin' ? 'bg-yellow-400 text-white' : 'bg-blue-200 text-blue-800'}`}>
                    {item.role === 'admin' ? 'Admin' : 'Doctor'}
                  </span>
                  {item.role !== 'admin' && (
                    <button
                      onClick={() => promoteDoctor(item._id)}
                      className="ml-2 px-2 py-1 bg-yellow-400 text-white rounded text-xs font-semibold hover:bg-yellow-500 transition"
                    >
                      Promote to Admin
                    </button>
                  )}
                  {item.role === 'admin' && (
                    <button
                      onClick={() => demoteDoctor(item._id)}
                      className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-semibold hover:bg-blue-300 transition"
                    >
                      Demote to Doctor
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 pb-4">
          <nav>
            <ul className="flex items-center gap-1">
              <li>
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  }`}
                >
                  Prev
                </button>
              </li>
              
              {[...Array(totalPages).keys()].map((number) => (
                <li key={number + 1}>
                  <button
                    onClick={() => paginate(number + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === number + 1
                        ? "bg-indigo-500 text-white"
                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    }`}
                  >
                    {number + 1}
                  </button>
                </li>
              ))}
              
              <li>
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  }`}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
