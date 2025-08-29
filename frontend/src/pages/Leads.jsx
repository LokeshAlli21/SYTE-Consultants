import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Search, RefreshCw, Users, Phone, Mail, MapPin, Calendar, User, Building } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md border">
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to access leads.</p>
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
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-500 mt-1">{pagination.totalRecords} total leads</p>
          </div>
          <button
            onClick={() => fetchLeads()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => { setSearch(""); fetchLeads(true); }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Leads */}
        {loading ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? "No results found" : "No leads yet"}
            </h3>
            <p className="text-gray-500">
              {search ? `No leads match "${search}"` : "Leads will appear here when available"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Lead Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Promoter:</span>
                        <span className="font-medium">{lead.promoter_name || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Project:</span>
                        <span className="font-medium">{lead.project_name || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Profile Contact</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span>{lead.profile_mobile_number || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="truncate">{lead.profile_email || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Registration Contact</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-orange-500" />
                        <span>{lead.registration_mobile_number || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-purple-500" />
                        <span className="truncate">{lead.registration_email || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span>{lead.district || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(lead.created_at)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 text-sm rounded-lg ${
                    pageNum === page ? "bg-blue-600 text-white" : "border hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Leads;