import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';

const AccountExpiryManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expiryInputs, setExpiryInputs] = useState({});
  const { backendUrl, aToken } = useContext(AdminContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/admin/users`, {
        headers: { aToken: aToken }
      });
      console.log('Fetched users response:', response.data); // Debug log
      // Defensive: ensure response.data is an array
      const usersArray = Array.isArray(response.data) ? response.data : [];
      setUsers(usersArray);
      
      // Initialize expiry inputs
      const inputs = {};
      usersArray.forEach(user => {
        inputs[user._id] = { minutes: 0, hours: 0, days: 0 };
      });
      setExpiryInputs(inputs);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleInputChange = (userId, field, value) => {
    setExpiryInputs(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: parseInt(value) || 0
      }
    }));
  };

  const setExpiry = async (userId) => {
    try {
      const { minutes, hours, days } = expiryInputs[userId];
      
      if (minutes === 0 && hours === 0 && days === 0) {
        return toast.warning('Please set a valid expiry time');
      }
      
      await axios.post(
        `${backendUrl}/api/admin/set-account-expiry`,
        { userId, minutes, hours, days },
        { headers: { aToken: aToken } }
      );
      
      toast.success('Account expiry set successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error setting expiry:', error);
      toast.error('Failed to set account expiry');
    }
  };

  const unexpireAccount = async (userId) => {
    try {
      await axios.post(
        `${backendUrl}/api/admin/unexpire-account`,
        { userId },
        { headers: { aToken: aToken } }
      );
      
      toast.success('Account unexpired successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error unexpiring account:', error);
      toast.error('Failed to unexpire account');
    }
  };

  const formatExpiryDate = (date) => {
    if (!date) return 'No expiry set';
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Account Expiry Management</h1>
        <button
          onClick={fetchUsers}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Expiry Status</th>
              <th className="px-4 py-2 border">Expires At</th>
              <th className="px-4 py-2 border">Set Expiry</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(users) ? users : []).map(user => (
              <tr key={user._id}>
                <td className="px-4 py-2 border">{user.name}</td>
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">
                  {user.isExpired ? (
                    <span className="text-red-500 font-semibold">Expired</span>
                  ) : (
                    <span className="text-green-500 font-semibold">Active</span>
                  )}
                </td>
                <td className="px-4 py-2 border">{formatExpiryDate(user.expiresAt)}</td>
                <td className="px-4 py-2 border">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        className="w-16 p-1 border rounded mr-2"
                        value={expiryInputs[user._id]?.minutes || 0}
                        onChange={(e) => handleInputChange(user._id, 'minutes', e.target.value)}
                      />
                      <span>Minutes</span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        className="w-16 p-1 border rounded mr-2"
                        value={expiryInputs[user._id]?.hours || 0}
                        onChange={(e) => handleInputChange(user._id, 'hours', e.target.value)}
                      />
                      <span>Hours</span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        className="w-16 p-1 border rounded mr-2"
                        value={expiryInputs[user._id]?.days || 0}
                        onChange={(e) => handleInputChange(user._id, 'days', e.target.value)}
                      />
                      <span>Days</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setExpiry(user._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Set Expiry
                    </button>
                    <button
                      onClick={() => unexpireAccount(user._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Unexpire Account
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountExpiryManagement;
