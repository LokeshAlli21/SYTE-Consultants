import React, { useState, useEffect } from 'react';
import { Phone, User, MapPin, Mail, Clock, Filter, Search, CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Eye, Calendar } from 'lucide-react';
import databaseService from '../backend-services/database/database';
import { useSelector } from 'react-redux';

function Telecalling() {
  const [batchData, setBatchData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  const userData = useSelector(state => state.auth.userData);
  const isAdmin = userData && userData.role === 'admin';
  const userAccessFields = userData?.access_fields || [];

  // Access control
  if (!isAdmin && !userAccessFields.includes('telecalling')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
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
        console.log("Fetched batch data:", data);
        const batchData = data?.batchData || [];
        setBatchData(batchData);
        setFilteredData(batchData);
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

    // Remove interested records from the list
    filtered = filtered.filter(item => item.status !== 'interested');

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
    setCurrentPage(1);
  }, [searchTerm, statusFilter, batchData]);

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Status update with confirmation
  const handleStatusUpdate = (record, newStatus) => {
    console.log(`Updating status for ${record.promoter_name} to ${newStatus}`);
    
    setConfirmationModal({
      record,
      newStatus,
      title: 'Confirm Status Update',
      message: `Are you sure you want to update ${record.promoter_name}'s status to "${newStatus.replace('_', ' ').toUpperCase()}"?`
    });
  };

  const confirmStatusUpdate = async () => {
    if (!confirmationModal) return;
    console.log(`Confirming status update for ${confirmationModal.record.promoter_id} to ${confirmationModal.newStatus}`);

    try {
      setIsUpdating(true);

      await databaseService.updateTelecallingStatus(confirmationModal.record.promoter_id, confirmationModal.newStatus);

      setBatchData(prev =>
        prev.map(item =>
          item.promoter_id === confirmationModal.record.promoter_id
            ? { ...item, status: confirmationModal.newStatus, updated_at: new Date().toISOString() }
            : item
        )
      );
      
      setConfirmationModal(null);
      setSelectedRecord(null);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 border-blue-200';
      case 'interested': return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200';
      case 'not_interested': return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200';
      default: return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border-gray-200';
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
    { value: 'not_interested', label: 'Not Interested' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
          <div className="relative">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading telecalling data...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait while we fetch your records</p>
        </div>
      </div>
    );
  }

    const handleContextMenu = (e) => e.preventDefault();
  const handleCopy = (e) => e.preventDefault();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 select-none"
     onContextMenu={handleContextMenu}                 // disables right click
      onCopy={handleCopy}                               // prevents copy
      role="region"
      aria-label="Telecalling module"
      >
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 bg-gradient-to-r from-white to-blue-50">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3">
              Telecalling Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Manage and track your telecalling activities with ease</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              Last updated: {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Stats */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          {/* Search and Filter Row */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Records</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, project, district, or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border outline-none border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="lg:w-72">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border outline-none border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 focus:bg-white transition-all"
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

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{batchData.length}</div>
              <div className="text-sm text-gray-600 font-medium">Total Records</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-4 rounded-xl border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-800">
                {batchData.filter(item => item.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-700 font-medium">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-4 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-800">
                {batchData.filter(item => item.status === 'in_progress').length}
              </div>
              <div className="text-sm text-blue-700 font-medium">In Progress</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-800">
                {batchData.filter(item => item.status === 'interested').length}
              </div>
              <div className="text-sm text-green-700 font-medium">Interested</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-100 p-4 rounded-xl border border-red-200">
              <div className="text-2xl font-bold text-red-800">
                {batchData.filter(item => item.status === 'not_interested').length}
              </div>
              <div className="text-sm text-red-700 font-medium">Not Interested</div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-700">
            <span className="text-lg font-semibold">{filteredData.length}</span>
            <span className="text-gray-500 ml-1">records found</span>
          </div>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Enhanced Records List */}
        <div className="space-y-4 mb-8">
          {currentRecords.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Records Found</h3>
              <p className="text-gray-600">No records match your current search criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            currentRecords.map((record) => (
              <div key={record.promoter_id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                <div className="p-6">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    {/* Enhanced Main Info */}
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-lg">{record.promoter_name}</div>
                              <div className="text-sm text-gray-500">ID: {record.promoter_id}</div>
                            </div>
                          </div>
                          <div className="ml-12">
                            <div className="text-gray-700 font-medium">{record.project_name}</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{record.profile_mobile_number}</div>
                              <div className="text-sm text-gray-500">Profile Number</div>
                            </div>
                          </div>
                          <div className="ml-12">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 truncate">{record.profile_email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <MapPin className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{record.district}</div>
                              <div className="text-sm text-gray-500">District</div>
                            </div>
                          </div>
                          <div className="ml-12">
                            <div className="text-xs text-gray-500">
                              Updated: {new Date(record.updated_at).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Status and Actions */}
                    <div className="flex flex-col sm:flex-row xl:flex-col items-center gap-4">
                      <div className={`flex items-center gap-3 px-4 py-2 rounded-full border text-sm font-semibold shadow-sm ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status.replace('_', ' ').toUpperCase()}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Update
                        </button>

                        <a
                          href={`tel:${record.profile_mobile_number}`}
                          className="flex items-center justify-center p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
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

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredData.length)} of {filteredData.length} records
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                          currentPage === page
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Status Update Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Update Status
                  </h3>
                  <p className="text-gray-600">
                    Change status for <span className="font-semibold">{selectedRecord.promoter_name}</span>
                  </p>
                </div>
                
                <div className="space-y-3 mb-8">
                  {['pending', 'in_progress', 'interested', 'not_interested'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedRecord, status)}
                      disabled={isUpdating}
                      className={`w-full p-4 text-left rounded-xl border transition-all duration-200 transform hover:scale-[1.02] ${
                        selectedRecord.status === status
                          ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-md'
                          : 'hover:bg-gray-50 border-gray-200 hover:shadow-md'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${selectedRecord.status === status ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {getStatusIcon(status)}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {status.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {status === 'pending' && 'Awaiting contact'}
                            {status === 'in_progress' && 'Currently being contacted'}
                            {status === 'interested' && 'Showed interest in project'}
                            {status === 'not_interested' && 'Not interested at this time'}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-full px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Confirmation Modal */}
        {confirmationModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {confirmationModal.title}
                </h3>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {confirmationModal.message}
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setConfirmationModal(null)}
                    disabled={isUpdating}
                    className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusUpdate}
                    disabled={isUpdating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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