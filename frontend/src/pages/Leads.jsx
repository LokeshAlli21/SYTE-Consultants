import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Search, RefreshCw, Users, Phone, Mail, MapPin, Calendar, User, Building, ChevronLeft, ChevronRight, Filter, TrendingUp } from "lucide-react";
import databaseService from "../backend-services/database/database";

function Leads() {
  const userData = useSelector((state) => state.auth.userData);
  const hasAccess = useMemo(() => 
    userData?.role === "admin" || userData?.access_fields?.includes("leads"), 
    [userData]
  );

  const [state, setState] = useState({
    leads: [],
    loading: false,
    error: null,
    page: 1,
    search: "",
    pagination: { totalRecords: 0, totalPages: 0, currentPage: 1 }
  });

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-3xl"></div>
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Access Denied</h2>
            <p className="text-white/80">You don't have permission to access the Leads module.</p>
          </div>
        </div>
      </div>
    );
  }

  const fetchLeads = async (resetPage = false) => {
    updateState({ loading: true, error: null });
    try {
      const currentPage = resetPage ? 1 : state.page;
      const response = await databaseService.getLeadsByUserId(userData.id, {
        page: currentPage, limit: 10, search: state.search,
      });
      updateState({
        leads: response.leads || [],
        pagination: response.pagination || { totalRecords: 0, totalPages: 0, currentPage: 1 },
        page: resetPage ? 1 : currentPage,
        loading: false
      });
    } catch (err) {
      updateState({ error: err.message || "Failed to fetch leads.", loading: false });
    }
  };

  useEffect(() => {
    if (userData?.id) fetchLeads();
  }, [userData?.id, state.page]);

  const handleSearch = (value) => {
    updateState({ search: value });
    if (value !== state.search) fetchLeads(true);
  };

  const clearSearch = () => {
    updateState({ search: "" });
    fetchLeads(true);
  };

  const formatDate = (dateString) => 
    dateString ? new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    }) : "N/A";

  const ContactCard = ({ icon: Icon, value, label, gradient }) => (
    <div className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-white/50 to-white/30 hover:from-white/70 hover:to-white/50 transition-all duration-300 border border-white/20">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 truncate">{value || "N/A"}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl"></div>
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Leads Management
              </h1>
              <p className="text-white/80 text-lg">Manage and track your lead generation activities</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <p className="text-3xl font-bold text-white">{state.pagination.totalRecords}</p>
                </div>
                <p className="text-white/70 text-sm">Total Leads</p>
              </div>
              
              <button
                onClick={() => fetchLeads()}
                disabled={state.loading}
                className="group p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <RefreshCw className={`w-6 h-6 ${state.loading ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-300`} />
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-3xl"></div>
          <div className="relative">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Search promoters, projects, contacts, or districts..."
                className="w-full pl-14 pr-12 py-4 bg-white/20 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition-all duration-300 text-white placeholder-white/60 backdrop-blur-sm"
                value={state.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {state.search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {state.error && (
          <div className="relative overflow-hidden bg-red-500/20 backdrop-blur-xl rounded-2xl border border-red-400/30 p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl"></div>
            <p className="relative text-red-200 font-medium flex items-center">
              <span className="w-6 h-6 bg-red-500/30 rounded-full flex items-center justify-center mr-3 text-xs">⚠</span>
              {state.error}
            </p>
          </div>
        )}

        {/* Loading */}
        {state.loading && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-16 text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/20 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/80 text-lg">Loading leads...</p>
            </div>
          </div>
        )}

        {/* Leads Cards */}
        {!state.loading && state.leads.length > 0 && (
          <div className="space-y-4">
            {state.leads.map((lead) => (
              <div key={lead.id} className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="space-y-4">
                    <ContactCard 
                      icon={User} 
                      value={lead.promoter_name} 
                      label="Promoter" 
                      gradient="from-blue-500 to-cyan-500" 
                    />
                    <ContactCard 
                      icon={Building} 
                      value={lead.project_name} 
                      label="Project" 
                      gradient="from-purple-500 to-pink-500" 
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <ContactCard 
                      icon={Phone} 
                      value={lead.profile_mobile_number} 
                      label="Profile Phone" 
                      gradient="from-emerald-500 to-teal-500" 
                    />
                    <ContactCard 
                      icon={Mail} 
                      value={lead.profile_email} 
                      label="Profile Email" 
                      gradient="from-blue-500 to-indigo-500" 
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <ContactCard 
                      icon={Phone} 
                      value={lead.registration_mobile_number} 
                      label="Registration Phone" 
                      gradient="from-orange-500 to-red-500" 
                    />
                    <ContactCard 
                      icon={Mail} 
                      value={lead.registration_email} 
                      label="Registration Email" 
                      gradient="from-violet-500 to-purple-500" 
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <ContactCard 
                      icon={MapPin} 
                      value={lead.district} 
                      label="District" 
                      gradient="from-red-500 to-rose-500" 
                    />
                    <ContactCard 
                      icon={Calendar} 
                      value={formatDate(lead.created_at)} 
                      label="Created" 
                      gradient="from-gray-500 to-slate-500" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!state.loading && state.leads.length === 0 && (
          <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl"></div>
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-600/30 to-gray-600/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Users className="w-16 h-16 text-white/60" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                {state.search ? "No leads found" : "No leads yet"}
              </h3>
              <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
                {state.search ? `No leads match "${state.search}"` : "Your leads will appear here once they're generated"}
              </p>
              {state.search && (
                <button
                  onClick={clearSearch}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  <span className="flex items-center">
                    <Filter className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                    Clear Search
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Pagination */}
        {state.pagination.totalPages > 1 && (
          <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl"></div>
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white/80 text-sm font-medium">
                <span className="text-white font-semibold">
                  {Math.min((state.page - 1) * 10 + 1, state.pagination.totalRecords)}-{Math.min(state.page * 10, state.pagination.totalRecords)}
                </span>
                {" "} of {" "}
                <span className="text-blue-400 font-semibold">{state.pagination.totalRecords}</span> leads
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  disabled={state.page === 1}
                  onClick={() => updateState({ page: state.page - 1 })}
                  className="group p-3 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 border border-white/20"
                >
                  <ChevronLeft className="w-5 h-5 text-white group-hover:-translate-x-0.5 transition-transform" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, state.pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(state.pagination.totalPages - 4, state.page - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateState({ page: pageNum })}
                        className={`w-12 h-12 rounded-xl text-sm font-bold transition-all duration-300 border ${
                          pageNum === state.page
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-110 border-blue-400/50"
                            : "bg-white/20 text-white/80 hover:bg-white/30 border-white/20 hover:scale-105"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={state.page === state.pagination.totalPages}
                  onClick={() => updateState({ page: state.page + 1 })}
                  className="group p-3 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 border border-white/20"
                >
                  <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Leads;