import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppContext } from "../context/AppContext";

const Doctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const [filterDoc, setFilterDoc] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage, setDoctorsPerPage] = useState(6);
  const [customDoctorsPerPage, setCustomDoctorsPerPage] = useState(6);

  useEffect(() => {
    applyFilter();
  }, [doctors, searchTerm, sortOption]);

  const applyFilter = () => {
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
    
    // Apply sorting
    if (sortOption === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === "availability") {
      filtered.sort((a, b) => (b.available === a.available ? 0 : b.available ? 1 : -1));
    } else if (sortOption === "price-low") {
      filtered.sort((a, b) => (a.fees || 0) - (b.fees || 0));
    } else if (sortOption === "price-high") {
      filtered.sort((a, b) => (b.fees || 0) - (a.fees || 0));
    }
    
    setFilterDoc(filtered);
  };

  // Update doctors per page
  const handleCustomDoctorsChange = (e) => {
    const value = parseInt(e.target.value);
    setCustomDoctorsPerPage(value);
  };

  const applyCustomPagination = () => {
    if (customDoctorsPerPage > 0) {
      setDoctorsPerPage(customDoctorsPerPage);
      setCurrentPage(1); // Reset to first page when changing items per page
    }
  };

  // Get current doctors for pagination
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filterDoc.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filterDoc.length / doctorsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRefresh = () => {
    applyFilter();
  };

  return (
    <div>
      <p className="text-gray-600">Browse through our doctors.</p>
      
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-4">
        <div className="w-full sm:w-3/4">
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="w-full sm:w-auto flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-gray-600">Sort by:</label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="default">Default</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="availability">Availability</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
          </select>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all mt-2 sm:mt-0"
        >
          Refresh
        </button>
      </div>

      {/* Custom pagination control */}
      <div className="flex items-center gap-2 mb-4">
        <label htmlFor="customPagination" className="text-sm text-gray-600">Show doctors per page:</label>
        <input
          id="customPagination"
          type="number"
          min="1" 
          max="50"
          value={customDoctorsPerPage}
          onChange={handleCustomDoctorsChange}
          className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          onClick={applyCustomPagination}
          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
        >
          Apply
        </button>
      </div>

      <div className="w-full">
        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">{filterDoc.length} doctors found</p>
        
        {/* Doctors grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-6">
          {currentDoctors.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(`/appointment/${item._id}`)}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
            >
              <img src={item.image} alt="" className="w-full h-auto object-contain" />
              <div className="p-4">
                <div
                  className={`flex items-center gap-2 text-sm text-center ${
                    item.available ? "text-green-500" : "text-gray-500"
                  }`}
                >
                  <p
                    className={`w-2 h-2 ${
                      item.available ? "bg-green-500" : "bg-gray-500"
                    } rounded-full`}
                  ></p>{" "}
                  <p>{item.available ? "Available" : "Not Available"}</p>
                </div>
                <p className="text-gray-900 text-lg font-medium">{item.name}</p>
                <p className="text-gray-600 text-sm">{item.speciality}</p>
                {item.fees && (
                  <p className="text-indigo-600 font-medium mt-1">Fee: ${item.fees}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
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
    </div>
  );
};

export default Doctors;
