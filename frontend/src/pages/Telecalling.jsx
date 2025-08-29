import React, { useState, useEffect } from 'react';
import { Phone, User, MapPin, Mail, Clock, Filter, Search, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import databaseService from '../backend-services/database/database';


function Telecalling() {
  const [batchData, setBatchData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock user data - replace with your actual useSelector
  const userData = { role: 'admin', access_fields: ['telecalling'], id: 1 };
  const isAdmin = userData && userData.role === 'admin';
  const userAccessFields = userData?.access_fields || [];

  // Access control
  if (!isAdmin && !userAccessFields.includes('telecalling')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access Telecalling.</p>
        </div>
      </div>
    );
  }

  // Fetch data on component mount
  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API call
        const data = await databaseService.getBatchDataByUserId(userData.id);
        setBatchData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching batch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBatchData();
  }, [userData.id]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = batchData;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.promoter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.profile_mobile_number.includes(searchTerm)
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, statusFilter, batchData]);

  // Update status function
  const updateStatus = async (recordId, newStatus) => {
    try {
      setIsUpdating(true);
      await databaseService.updateTelecallingStatus(recordId, newStatus);

      // Update local state
      setBatchData(prev => 
        prev.map(item => 
          item.promoter_id === recordId 
            ? { ...item, status: newStatus, updated_at: new Date().toISOString() }
            : item
        )
      );
      
      setSelectedRecord(null);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interested': return 'bg-green-100 text-green-800 border-green-200';
      case 'not_interested': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4" />;
      case 'interested': return <CheckCircle className="w-4 h-4" />;
      case 'not_interested': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'interested', label: 'Interested' },
    { value: 'not_interested', label: 'Not Interested' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading telecalling data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Telecalling Dashboard</h1>
          <p className="text-gray-600">Manage and track your telecalling activities</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, project, district, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{batchData.length}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-800">
                {batchData.filter(item => item.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800">
                {batchData.filter(item => item.status === 'interested').length}
              </div>
              <div className="text-sm text-green-700">Interested</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-800">
                {batchData.filter(item => item.status === 'not_interested').length}
              </div>
              <div className="text-sm text-red-700">Not Interested</div>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No records found matching your criteria</p>
            </div>
          ) : (
            filteredData.map((record) => (
              <div key={record.promoter_id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Main Info */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{record.promoter_name}</span>
                        </div>
                        <div className="text-sm text-gray-600">{record.project_name}</div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{record.profile_mobile_number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">{record.profile_email}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{record.district}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Updated: {new Date(record.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status.replace('_', ' ').toUpperCase()}
                      </div>

                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Update Status
                      </button>

                      <a
                        href={`tel:${record.profile_mobile_number}`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Call"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status Update Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Update Status for {selectedRecord.promoter_name}
                </h3>
                
                <div className="space-y-3">
                  {['pending', 'in_progress', 'interested', 'not_interested'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedRecord.promoter_id, status)}
                      disabled={isUpdating}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        selectedRecord.status === status
                          ? 'bg-blue-50 border-blue-200 text-blue-800'
                          : 'hover:bg-gray-50 border-gray-200'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status)}
                        <span className="font-medium">
                          {status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Telecalling;