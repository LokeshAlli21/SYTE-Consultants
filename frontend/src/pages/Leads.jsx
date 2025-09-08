import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  User, 
  Building, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  PhoneOff,
  PhoneCall,
  UserCheck,
  UserX
} from "lucide-react";
import databaseService from "../backend-services/database/database";

function Leads() {
  const userData = useSelector((state) => state.auth.userData);
  const isAdmin = userData && userData.role === "admin";
  const userAccessFields = userData?.access_fields || [];

  // Local state
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ 
    totalRecords: 0, 
    totalPages: 0, 
    currentPage: 1 
  });
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Lead statuses with icons and colors
  const leadStatuses = [
    { 
      value: "Lead Generated", 
      label: "Lead Generated", 
      icon: UserCheck, 
      color: "bg-blue-50 text-blue-700 border-blue-200",
      iconColor: "text-blue-600"
    },
    { 
      value: "Call Not Connected", 
      label: "Call Not Connected", 
      icon: PhoneOff, 
      color: "bg-red-50 text-red-700 border-red-200",
      iconColor: "text-red-600"
    },
    { 
      value: "Call Not Received", 
      label: "Call Not Received", 
      icon: PhoneCall, 
      color: "bg-orange-50 text-orange-700 border-orange-200",
      iconColor: "text-orange-600"
    },
    { 
      value: "Call Back", 
      label: "Call Back", 
      icon: Clock, 
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      iconColor: "text-yellow-600"
    },
    { 
      value: "Invalid Number", 
      label: "Invalid Number", 
      icon: AlertCircle, 
      color: "bg-gray-50 text-gray-700 border-gray-200",
      iconColor: "text-gray-600"
    },
    { 
      value: "Call Dropped", 
      label: "Call Dropped", 
      icon: XCircle, 
      color: "bg-red-50 text-red-700 border-red-200",
      iconColor: "text-red-600"
    },
    { 
      value: "Follow Up", 
      label: "Follow Up", 
      icon: Calendar, 
      color: "bg-purple-50 text-purple-700 border-purple-200",
      iconColor: "text-purple-600"
    },
    { 
      value: "Lead Closed", 
      label: "Lead Closed", 
      icon: CheckCircle, 
      color: "bg-green-50 text-green-700 border-green-200",
      iconColor: "text-green-600"
    },
    { 
      value: "Lead Lost", 
      label: "Lead Lost", 
      icon: UserX, 
      color: "bg-red-50 text-red-700 border-red-200",
      iconColor: "text-red-600"
    }
  ];

  // Get status config by value
  const getStatusConfig = (status) => {
    return leadStatuses.find(s => s.value === status) || leadStatuses[0];
  };

  // Permission check
  if (!isAdmin && !userAccessFields.includes("leads")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h2>
          <p className="text-gray-600 leading-relaxed">You don't have permission to access the Leads module. Contact your administrator for access.</p>
        </div>
      </div>
    );
  }

  // Fetch leads
  const fetchLeads = async (resetPage = false) => {
    setLoading(true);
    setError(null);
    try {
      const currentPage = resetPage ? 1 : page;
      const response = await databaseService.getLeadsByUserId(userData.id, {
        page: currentPage,
        limit,
        search,
      });
      console.log("Fetched leads:", response);
      setLeads(response.leads || []);
      setPagination(response.pagination || { totalRecords: 0, totalPages: 0, currentPage: 1 });
      if (resetPage) setPage(1);
    } catch (err) {
      setError(err.message || "Failed to fetch leads.");
    } finally {
      setLoading(false);
    }
  };

  // Update lead status
  const updateLeadStatus = async (leadId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [leadId]: true }));
    try {
      await databaseService.updateLeadStatus(leadId, newStatus);
      
      // Update the lead in local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: newStatus }
          : lead
      ));
      
      // Show success feedback (you can add a toast notification here)
      console.log(`Lead ${leadId} status updated to: ${newStatus}`);
      
    } catch (err) {
      console.error("Failed to update lead status:", err);
      // You can add error notification here
      setError(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [leadId]: false }));
    }
  };

  useEffect(() => {
    if (userData?.id) {
      fetchLeads();
    }
  }, [userData?.id, page, limit]);

  // Handle search
  const handleSearch = (value) => {
    setSearch(value);
    if (value !== search) {
      fetchLeads(true);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearch("");
    fetchLeads(true);
  };

  // Refresh data
  const refreshData = () => {
    fetchLeads();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Status Dropdown Component
  const StatusDropdown = ({ lead }) => {
    const [isOpen, setIsOpen] = useState(false);
    const currentStatus = getStatusConfig(lead.status);
    const isUpdating = updatingStatus[lead.id];

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 hover:shadow-sm ${currentStatus.color} ${
            isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
          }`}
        >
          <div className="flex items-center space-x-2">
            {isUpdating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <currentStatus.icon className={`w-4 h-4 ${currentStatus.iconColor}`} />
            )}
            <span className="truncate">{currentStatus.label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
            {leadStatuses.map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  updateLeadStatus(lead.id, status.value);
                  setIsOpen(false);
                }}
                disabled={status.value === lead.status || isUpdating}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                  status.value === lead.status 
                    ? 'bg-gray-50 opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <status.icon className={`w-4 h-4 ${status.iconColor}`} />
                <span className="text-gray-800 font-medium">{status.label}</span>
                {status.value === lead.status && (
                  <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Pagination component
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 space-y-4 sm:space-y-0 select-none">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{Math.min((page - 1) * limit + 1, pagination.totalRecords)}</span> to{" "}
          <span className="font-medium">{Math.min(page * limit, pagination.totalRecords)}</span> of{" "}
          <span className="font-medium">{pagination.totalRecords}</span> leads
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pages.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                pageNum === page
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  
  const handleContextMenu = (e) => e.preventDefault();
  const handleCopy = (e) => e.preventDefault();
  
  return (
    <div className="min-h-screen bg-gray-50 select-none"
      onContextMenu={handleContextMenu}
      onCopy={handleCopy}
      role="region"
      aria-label="Telecalling module">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-7 h-7 text-white" />
                </div>
                Leads
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Track and manage your lead generation pipeline
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {pagination.totalRecords}
                </p>
                <p className="text-sm text-gray-500 font-medium">Total Leads</p>
              </div>
              <button
                onClick={refreshData}
                disabled={loading}
                className="p-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 border border-gray-200 disabled:opacity-50 transition-all duration-200 shadow-sm"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search promoter, project, phone, email, or district..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            {/* Page Limit Selector */}
            <div className="flex items-center space-x-2 bg-gray-50 rounded-xl px-4 py-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</span>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600 whitespace-nowrap">per page</span>
            </div>

            {search && (
              <button
                onClick={clearSearch}
                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center font-medium"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-lg font-bold">!</span>
              </div>
              <div>
                <h3 className="text-red-900 font-semibold text-lg mb-1">Unable to Load Leads</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <span className="text-gray-700 font-medium">Loading your leads...</span>
            </div>
          </div>
        )}

        {/* Leads Cards - Modern Card Layout */}
        {!loading && leads.length > 0 && (
          <div className="grid gap-6">
            {leads.map((lead, index) => (
              <div 
                key={lead.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 hover:border-gray-200"
              >
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Lead Details */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-lg leading-tight">
                          {lead.promoter_name || "Unknown Promoter"}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">Promoter</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 leading-tight">
                          {lead.project_name || "No Project"}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">Project</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Contact */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Profile Contact</h4>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {lead.profile_mobile_number || "Not provided"}
                        </p>
                        <p className="text-xs text-gray-500">Mobile</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm break-all">
                          {lead.profile_email || "Not provided"}
                        </p>
                        <p className="text-xs text-gray-500">Email</p>
                      </div>
                    </div>
                  </div>

                  {/* Registration Contact */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Registration Contact</h4>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {lead.registration_mobile_number || "Not provided"}
                        </p>
                        <p className="text-xs text-gray-500">Mobile</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm break-all">
                          {lead.registration_email || "Not provided"}
                        </p>
                        <p className="text-xs text-gray-500">Email</p>
                      </div>
                    </div>
                  </div>

                  {/* Location & Date */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Details</h4>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {lead.district || "Not specified"}
                        </p>
                        <p className="text-xs text-gray-500">District</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {formatDate(lead.created_at)}
                        </p>
                        <p className="text-xs text-gray-500">Created</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Lead Status</h4>
                    <StatusDropdown lead={lead} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && leads.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {search ? "No matching leads" : "No leads yet"}
            </h3>
            <p className="text-gray-600 mb-6 text-lg max-w-md mx-auto leading-relaxed">
              {search 
                ? `We couldn't find any leads matching "${search}". Try adjusting your search terms.`
                : "Your leads will appear here once they start coming in. Start generating leads to see them here."
              }
            </p>
            {search && (
              <button
                onClick={clearSearch}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {renderPagination()}

        {/* Stats Footer */}
        {leads.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-blue-700">{pagination.totalRecords}</p>
                <p className="text-sm text-blue-600 font-medium">Total Leads</p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-green-700">{pagination.currentPage}</p>
                <p className="text-sm text-green-600 font-medium">Current Page</p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Filter className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-purple-700">{pagination.totalPages}</p>
                <p className="text-sm text-purple-600 font-medium">Total Pages</p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-orange-700">{limit}</p>
                <p className="text-sm text-orange-600 font-medium">Per Page</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leads;