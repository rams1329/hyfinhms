// admin/src/pages/Admin/DegreeManagement.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';

const DegreeManagement = () => {
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDegree, setNewDegree] = useState('');
  const [editingDegree, setEditingDegree] = useState(null);
  const [editName, setEditName] = useState('');

  const { backendUrl, aToken } = useContext(AdminContext);

  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/degrees/all`);
      
      if (data.success) {
        setDegrees(data.degrees);
      } else {
        toast.error(data.message || 'Failed to fetch degrees');
      }
    } catch (error) {
      console.error('Error fetching degrees:', error);
      toast.error('Failed to fetch degrees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDegree = async (e) => {
    e.preventDefault();
    
    if (!newDegree.trim()) {
      return toast.warning('Please enter a degree');
    }
    
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/degrees/add`,
        { name: newDegree },
        { headers: { aToken } }
      );
      
      if (data.success) {
        toast.success(data.message);
        setNewDegree('');
        fetchDegrees();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error adding degree:', error);
      toast.error('Failed to add degree');
    }
  };

  const handleStartEdit = (degree) => {
    setEditingDegree(degree._id);
    setEditName(degree.name);
  };

  const handleCancelEdit = () => {
    setEditingDegree(null);
    setEditName('');
  };

  const handleUpdateDegree = async (id) => {
    if (!editName.trim()) {
      return toast.warning('Please enter a degree name');
    }
    
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/degrees/update`,
        { id, name: editName },
        { headers: { aToken } }
      );
      
      if (data.success) {
        toast.success(data.message);
        setEditingDegree(null);
        setEditName('');
        fetchDegrees();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating degree:', error);
      toast.error('Failed to update degree');
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/degrees/update`,
        { id, active: !currentActive },
        { headers: { aToken } }
      );
      
      if (data.success) {
        toast.success(data.message);
        fetchDegrees();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error toggling degree status:', error);
      toast.error('Failed to update degree status');
    }
  };

  const handleDeleteDegree = async (id) => {
    if (!window.confirm('Are you sure you want to delete this degree?')) {
      return;
    }
    
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/degrees/delete/${id}`,
        { headers: { aToken } }
      );
      
      if (data.success) {
        toast.success(data.message);
        fetchDegrees();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting degree:', error);
      toast.error('Failed to delete degree');
    }
  };

  if (loading && degrees.length === 0) {
    return <div className="text-center p-5">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Degree Management</h1>
        <button
          onClick={fetchDegrees}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Degree</h2>
        <form onSubmit={handleAddDegree} className="flex gap-4">
          <input
            type="text"
            value={newDegree}
            onChange={(e) => setNewDegree(e.target.value)}
            placeholder="Enter degree or qualification"
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Add Degree
          </button>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Manage Degrees</h2>
        
        {degrees.length === 0 ? (
          <p className="text-gray-500">No degrees found. Add some above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {degrees.map((degree) => (
                  <tr key={degree._id} className="border-t">
                    <td className="px-4 py-3">
                      {editingDegree === degree._id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-1"
                        />
                      ) : (
                        degree.name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          degree.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {degree.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editingDegree === degree._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateDegree(degree._id)}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartEdit(degree)}
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(degree._id, degree.active)}
                            className={`${
                              degree.active
                                ? 'bg-amber-500 hover:bg-amber-600'
                                : 'bg-green-500 hover:bg-green-600'
                            } text-white px-2 py-1 rounded text-sm`}
                          >
                            {degree.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteDegree(degree._id)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DegreeManagement;
