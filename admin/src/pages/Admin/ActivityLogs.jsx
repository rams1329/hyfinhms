// admin/src/pages/Admin/ActivityLogs.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';
import { format } from 'date-fns';

const ActivityLogs = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    action: '',
    startDate: '',
    endDate: '',
    userId: ''
  });

  // Action types for filter dropdown
  const actionTypes = [
    { value: '', label: 'All Actions' },
    { value: 'USER_LOGIN', label: 'User Login' },
    { value: 'USER_LOGOUT', label: 'User Logout' },
    { value: 'PASSWORD_RESET', label: 'Password Reset' },
    { value: 'ACCOUNT_CREATED', label: 'Account Created' },
    { value: 'PROFILE_UPDATED', label: 'Profile Updated' },
    { value: 'APPOINTMENT_BOOKED', label: 'Appointment Booked' },
    { value: 'APPOINTMENT_CANCELLED', label: 'Appointment Cancelled' },
    { value: 'PAYMENT_MADE', label: 'Payment Made' }
  ];

  useEffect(() => {
    fetchLogs();
  }, [page, filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Build query string from filters
      const queryParams = new URLSearchParams({
        page,
        limit: 20,
        ...Object.fromEntries(Object.entries(filter).filter(([_, v]) => v))
      });
      
      const { data } = await axios.get(
        `${backendUrl}/api/admin/activity-logs?${queryParams}`,
        { headers: { aToken } }
      );
      
      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      } else {
        toast.error(data.message || 'Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filter changes
  };

  const resetFilters = () => {
    setFilter({
      action: '',
      startDate: '',
      endDate: '',
      userId: ''
    });
    setPage(1);
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const renderActionBadge = (action) => {
    const badgeClasses = {
      'USER_LOGIN': 'bg-green-100 text-green-800',
      'USER_LOGOUT': 'bg-gray-100 text-gray-800',
      'PASSWORD_RESET': 'bg-yellow-100 text-yellow-800',
      'ACCOUNT_CREATED': 'bg-purple-100 text-purple-800',
      'PROFILE_UPDATED': 'bg-indigo-100 text-indigo-800',
      'APPOINTMENT_BOOKED': 'bg-green-100 text-green-800',
      'APPOINTMENT_CANCELLED': 'bg-red-100 text-red-800',
      'PAYMENT_MADE': 'bg-blue-100 text-blue-800'
    };
    
    const actionLabels = {
      'USER_LOGIN': 'Logged In',
      'USER_LOGOUT': 'Logged Out',
      'PASSWORD_RESET': 'Reset Password',
      'ACCOUNT_CREATED': 'Created Account',
      'PROFILE_UPDATED': 'Updated Profile',
      'APPOINTMENT_BOOKED': 'Booked Appointment',
      'APPOINTMENT_CANCELLED': 'Cancelled Appointment',
      'PAYMENT_MADE': 'Made Payment'
    };
    
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badgeClasses[action] || 'bg-gray-100'}`}>
        {actionLabels[action] || action}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Activity Logs</h1>
        <button
          onClick={fetchLogs}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
            <select
              name="action"
              value={filter.action}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              {actionTypes.map(action => (
                <option key={action.value} value={action.value}>{action.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filter.startDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filter.endDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            No activity logs found. Try adjusting your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-xs text-gray-500">{log.userId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {log.details && Object.entries(log.details).map(([key, value]) => (
                          <div key={key} className="mb-1">
                            <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                            {typeof value === 'object' ? JSON.stringify(value) : value}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
