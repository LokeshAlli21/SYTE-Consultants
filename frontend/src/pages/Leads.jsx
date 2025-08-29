import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Search, Filter, RefreshCw, Users, Phone, Mail, MapPin, Calendar, User, Building } from "lucide-react";
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

  // Permission check
  if (!isAdmin && !userAccessFields.includes("leads")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the Leads module.</p>
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
      setLeads(response.leads || []);
      setPagination(response.pagination || { totalRecords: 0, totalPages: 0, currentPage: 1 });
      if (resetPage) setPage(1);
    } catch (err) {
      setError(err.message || "Failed to fetch leads.");
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {Math.min((page - 1) * limit + 1, pagination.totalRecords)} to{" "}
          {Math.min(page * limit, pagination.totalRecords)} of {pagination.totalRecords} leads
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(1)}
            className="px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>
          
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            className="px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {pages.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`px-3 py-2 text-sm border rounded-lg ${
                pageNum === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
            className="px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          
          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(pagination.totalPages)}
            className="px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                Leads Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track your lead generation activities
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{pagination.totalRecords}</p>
                <p className="text-sm text-gray-500">Total Leads</p>
              </div>
              <button
                onClick={refreshData}
                disabled={loading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by promoter, project, phone, email, or district..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearSearch}
                disabled={!search}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 text-sm font-semibold">!</span>
              </div>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Leads</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-3" />
              <span className="text-gray-600">Loading leads...</span>
            </div>
          </div>
        )}

        {/* Leads Table */}
        {!loading && leads.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Lead Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Registration Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location & Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leads.map((lead, index) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      {/* Lead Details */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {lead.promoter_name || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">Promoter</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Building className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <p className="font-medium text-gray-700">
                                {lead.project_name || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">Project</p>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Information */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-green-500 mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {lead.profile_mobile_number || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">Profile Phone</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-blue-500 mr-2" />
                            <div>
                              <p className="font-medium text-gray-700 text-sm">
                                {lead.profile_email || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">Profile Email</p>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Registration Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-orange-500 mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {lead.registration_mobile_number || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">Registration Phone</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-purple-500 mr-2" />
                            <div>
                              <p className="font-medium text-gray-700 text-sm">
                                {lead.registration_email || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">Registration Email</p>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location & Date */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-red-500 mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {lead.district || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">District</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm text-gray-700">
                                {formatDate(lead.created_at)}
                              </p>
                              <p className="text-xs text-gray-500">Created</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && leads.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {search ? "No leads found" : "No leads yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {search 
                ? `No leads match your search for "${search}"`
                : "Your leads will appear here once they're generated"
              }
            </p>
            {search && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          <div className="mt-6 bg-white rounded-xl shadow-sm border p-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{pagination.totalRecords}</p>
                <p className="text-sm text-gray-500">Total Leads</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{pagination.currentPage}</p>
                <p className="text-sm text-gray-500">Current Page</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{pagination.totalPages}</p>
                <p className="text-sm text-gray-500">Total Pages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{limit}</p>
                <p className="text-sm text-gray-500">Per Page</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leads;