import React, { useState, useEffect } from 'react';
import { Phone, User, MapPin, Mail, Clock, Filter, Search, CheckCircle, XCircle, AlertCircle, RefreshCw, Eye, Calendar, TrendingUp, Users } from 'lucide-react';
import databaseService from '../backend-services/database/database';

function Telecalling() {
  const [batchData, setBatchData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const userData = { role: 'admin', access_fields: ['telecalling'], id: 1 };
  const isAdmin = userData && userData.role === 'admin';
  const userAccessFields = userData?.access_fields || [];

  // Access control
  if (!isAdmin && !userAccessFields.includes('telecalling')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.promoter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.profile_mobile_number.includes(searchTerm)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, statusFilter, batchData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredData.slice(startIndex, startIndex + recordsPerPage);

  // Handle status update with confirmation
  const handleStatusUpdate = (record, newStatus) => {
    console.log("Updating status for record:", record.id, "New status:", newStatus);
    setPendingUpdate({ record, newStatus });
    setShowConfirmDialog(true);
  };

  // Confirm status update
  const confirmStatusUpdate = async () => {
    if (!pendingUpdate) return;
    
    try {
      setIsUpdating(true);
      await databaseService.updateTelecallingStatus(pendingUpdate.record.id, pendingUpdate.newStatus);
      
      setBatchData(prev => 
        prev.map(item => 
          item.promoter_id === pendingUpdate.record.promoter_id 
            ? { ...item, status: pendingUpdate.newStatus, updated_at: new Date().toISOString() }
            : item
        )
      );
      
      setSelectedRecord(null);
      setShowConfirmDialog(false);
      setPendingUpdate(null);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'interested': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'not_interested': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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
    { value: 'all', label: 'All Status', count: batchData.length },
    { value: 'pending', label: 'Pending', count: batchData.filter(item => item.status === 'pending').length },
    { value: 'in_progress', label: 'In Progress', count: batchData.filter(item => item.status === 'in_progress').length },
    { value: 'interested', label: 'Interested', count: batchData.filter(item => item.status === 'interested').length },
    { value: 'not_interested', label: 'Not Interested', count: batchData.filter(item => item.status === 'not_interested').length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading telecalling data...</p>
          <p className="text-sm text-gray-400 mt-1">Please wait while we fetch your records</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Telecalling Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Manage and track your telecalling activities with ease</p>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{batchData.length}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-800">
                {batchData.filter(item => item.status === 'pending').length}
              </div>
              <div className="text-sm text-amber-700">Pending Calls</div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-800">
                {batchData.filter(item => item.status === 'interested').length}
              </div>
              <div className="text-sm text-emerald-700">Interested</div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <XCircle className="w-6 h-6 text-rose-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-800">
                {batchData.filter(item => item.status === 'not_interested').length}
              </div>
              <div className="text-sm text-rose-700">Not Interested</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, project, district, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-80">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-300 bg-gray-50 focus:bg-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {startIndex + 1}-{Math.min(startIndex + recordsPerPage, filteredData.length)} of {filteredData.length} records
            </span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-4 mb-6">
          {currentRecords.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            currentRecords.map((record) => (
              <div key={record.promoter_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
                <div className="p-6">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    {/* Main Info */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-lg">{record.promoter_name}</div>
                            <div className="text-sm text-gray-500">ID: #{record.promoter_id}</div>
                          </div>
                        </div>
                        <div className="ml-13 text-sm font-medium text-gray-700">{record.project_name}</div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.profile_mobile_number}</div>
                            <div className="text-xs text-gray-500">Primary</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-gray-900 truncate">{record.profile_email}</div>
                            <div className="text-xs text-gray-500">Email</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.district}</div>
                            <div className="text-xs text-gray-500">District</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 ml-3">
                          Last updated: {new Date(record.updated_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col sm:flex-row xl:flex-col items-center gap-4 xl:min-w-fit">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status.replace('_', ' ').toUpperCase()}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg"
                        >
                          Update Status
                        </button>

                        <a
                          href={`tel:${record.profile_mobile_number}`}
                          className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Call Now"
                        >
                          <Phone className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl transition-all duration-300 ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Update Status
                  </h3>
                  <p className="text-gray-600">
                    {selectedRecord.promoter_name} • {selectedRecord.project_name}
                  </p>
                </div>
                
                <div className="space-y-3 mb-8">
                  {['pending', 'in_progress', 'interested', 'not_interested'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedRecord, status)}
                      disabled={isUpdating}
                      className={`w-full p-4 text-left rounded-2xl border transition-all duration-300 ${
                        selectedRecord.status === status
                          ? 'bg-blue-50 border-blue-200 text-blue-800 ring-2 ring-blue-200'
                          : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${getStatusColor(status).split(' ')[0]}`}>
                          {getStatusIcon(status)}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">
                            {status.replace('_', ' ').toUpperCase()}
                          </span>
                          {selectedRecord.status === status && (
                            <div className="text-sm text-blue-600 mt-1">Current status</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="flex-1 px-6 py-3 text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && pendingUpdate && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Status Update</h3>
                
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
                  <div className="text-sm text-gray-600 mb-2">Promoter</div>
                  <div className="font-semibold text-gray-900 mb-3">{pendingUpdate.record.promoter_name}</div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Change status to:</div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold mt-1 ${getStatusColor(pendingUpdate.newStatus)}`}>
                        {getStatusIcon(pendingUpdate.newStatus)}
                        {pendingUpdate.newStatus.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-8">
                  Are you sure you want to update the status? This action will be recorded in the system.
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowConfirmDialog(false);
                      setPendingUpdate(null);
                    }}
                    disabled={isUpdating}
                    className="flex-1 px-6 py-3 text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusUpdate}
                    disabled={isUpdating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Confirm Update'
                    )}
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