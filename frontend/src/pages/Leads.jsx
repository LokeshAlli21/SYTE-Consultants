import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Search, RefreshCw, Users, Phone, Mail, MapPin, Calendar, User, Building, ChevronLeft, ChevronRight } from "lucide-react";
import databaseService from "../backend-services/database/database";

function Leads() {
  const userData = useSelector((state) => state.auth.userData);
  const isAdmin = userData && userData.role === "admin";
  const userAccessFields = userData?.access_fields || [];

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ totalRecords: 0, totalPages: 0, currentPage: 1 });

  const limit = 10;

  if (!isAdmin && !userAccessFields.includes("leads")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the Leads module.</p>
        </div>
      </div>
    );
  }

  const fetchLeads = async (resetPage = false) => {
    setLoading(true);
    setError(null);
    try {
      const currentPage = resetPage ? 1 : page;
      const response = await databaseService.getLeadsByUserId(userData.id, {
        page: currentPage, limit, search,
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
    if (userData?.id) fetchLeads();
  }, [userData?.id, page]);

  const handleSearch = (value) => {
    setSearch(value);
    if (value !== search) fetchLeads(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                Leads Management
              </h1>
              <p className="text-gray-600 mt-1">Manage and track your lead generation activities</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                <p className="text-2xl font-bold">{pagination.totalRecords}</p>
                <p className="text-xs opacity-90">Total Leads</p>
              </div>
              <button
                onClick={() => fetchLeads()}
                disabled={loading}
                className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => { setSearch(""); fetchLeads(true); }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-4">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Loading leads...</p>
          </div>
        )}

        {/* Leads Grid */}
        {!loading && leads.length > 0 && (
          <div className="grid gap-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Lead Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{lead.promoter_name || "N/A"}</p>
                        <p className="text-sm text-gray-500">Promoter</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">{lead.project_name || "N/A"}</p>
                        <p className="text-sm text-gray-500">Project</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Contact */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lead.profile_mobile_number || "N/A"}</p>
                        <p className="text-sm text-gray-500">Profile Phone</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 text-sm">{lead.profile_email || "N/A"}</p>
                        <p className="text-sm text-gray-500">Profile Email</p>
                      </div>
                    </div>
                  </div>

                  {/* Registration Contact */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lead.registration_mobile_number || "N/A"}</p>
                        <p className="text-sm text-gray-500">Registration Phone</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 text-sm">{lead.registration_email || "N/A"}</p>
                        <p className="text-sm text-gray-500">Registration Email</p>
                      </div>
                    </div>
                  </div>

                  {/* Location & Date */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lead.district || "N/A"}</p>
                        <p className="text-sm text-gray-500">District</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">{formatDate(lead.created_at)}</p>
                        <p className="text-sm text-gray-500">Created</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && leads.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {search ? "No leads found" : "No leads yet"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {search ? `No leads match "${search}"` : "Your leads will appear here once they're generated"}
            </p>
            {search && (
              <button
                onClick={() => { setSearch(""); fetchLeads(true); }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
            <div className="text-sm text-gray-600">
              {Math.min((page - 1) * limit + 1, pagination.totalRecords)}-{Math.min(page * limit, pagination.totalRecords)} of {pagination.totalRecords}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                        pageNum === page
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Leads;