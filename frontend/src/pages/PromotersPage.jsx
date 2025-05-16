import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBell,
  FaUserCircle, // or FaRegUserCircle instead of FaRegCircleUser
  FaPlus,
  FaSearch,
  FaWhatsapp,
  FaEye,
  FaEdit,
  FaTrash,
  FaFilter,
  FaFileExport,
  FaEnvelope,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { IoMail, IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import databaseService from "../backend-services/database/database";
import Select from "react-select";

const PromotersPage = () => {
  const navigate = useNavigate();
  
  // State Management
  const [promoters, setPromoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [promotersPerPage, setPromotersPerPage] = useState(10); // Increased from 5
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ district: "", city: "", email_id: '', contact_number: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  // Location Data
  const [districtOptions, setDistrictOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [districtCityMap, setDistrictCityMap] = useState({});
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0
  });
  
  // Fetch Cities and Districts
  useEffect(() => {
    async function fetchCitiesAndDistricts() {
      try {
        const { districtOptions, districtCityMap } = await databaseService.getAllCitiesAndDistricts();
        setDistrictCityMap(districtCityMap);
        setDistrictOptions(districtOptions);
      } catch (error) {
        console.error("Error fetching cities and districts:", error);
        toast.error("Failed to load location data");
      }
    }

    fetchCitiesAndDistricts();
  }, []);

  // Update City Options when District changes
  useEffect(() => {
    if (filters.district) {
      setCityOptions(districtCityMap[filters.district] || []);
    } else {
      setCityOptions([]);
    }
  }, [filters.district, districtCityMap]);

  // Fetch Promoters Data
  const fetchPromoters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await databaseService.getAllPromoters();
      // console.log(data);
      setPromoters(data)
      
      // Calculate stats
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      setStats({
        total: data.length,
        active: data.filter(p => p.status === "active").length || Math.floor(data.length * 0.8),
        newThisMonth: data.filter(p => {
          if (!p.created_at) return false;
          const createdDate = new Date(p.created_at);
          return createdDate.getMonth() + 1 === currentMonth && 
                 createdDate.getFullYear() === currentYear;
        }).length || Math.floor(data.length * 0.2)
      });
    } catch (error) {
      toast.error("❌ Failed to load promoters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromoters();
  }, [fetchPromoters]);

  // Sort Logic - Memoized to improve performance
  const sortedPromoters = useMemo(() => {
    if (!sortConfig.key) return promoters;
    
    return [...promoters].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      
      if (aVal < bVal) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [promoters, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === currentPromoters.length) {
      setSelectedIds([]);
    } else {
      // console.log(currentPromoters);
      
      setSelectedIds(currentPromoters.map((p) => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Search & Filter Handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ district: "", city: "", email_id: '', contact_number: '' });
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Navigation Handlers
  const handlePageChange = (page) => {
    setSelectedIds([])
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Scroll to top of table
    document.querySelector('.promoter-table').scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewPromoterClick = () => {
    navigate("/promoters/add");
  };

  const handleEdit = (id) => navigate(`/promoters/edit/${id}`);
  const handleView = (id) => navigate(`/promoters/view/${id}`);
  
  // Communication Handlers
  const sendMail = (email, subject = "Hello", body = "This is a test message.") => {
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");
  };
  
  const sendWhatsapp = (phoneNumber, message = "Hello! This is a test message.") => {
    // Ensure phone number is properly formatted
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
    const whatsappLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
  };

  const handleMail = (id) => {
    const promoter = promoters.find(p => p.id === id);
    if (promoter?.email_id) {
      sendMail(promoter.email_id, "Regarding Your Promotion", `Dear ${promoter.promoter_name},\n\nI hope this message finds you well.`);
    } else {
      toast.error("No email address available");
    }
  };
  
  const handleWhatsapp = (id) => {
    const promoter = promoters.find(p => p.id === id);
    if (promoter?.contact_number) {
      sendWhatsapp(promoter.contact_number, `Hi ${promoter.promoter_name}! Just checking in about our project.`);
    } else {
      toast.error("No contact number available");
    }
  };

  // Bulk Actions
  const handleBulkMail = () => {
    if (selectedIds.length === 0) {
      toast.info("Please select promoters first");
      return;
    }
    
    const emails = promoters
      .filter(p => selectedIds.includes(p.id) && p.email_id)
      .map(p => p.email_id)
      .join(",");
      
    if (emails) {
      sendMail(emails, "Important Announcement", "Dear Promoters,\n\nWe have an important update to share with you.");
      toast.success(`Email drafted for ${selectedIds.length} promoters`);
    } else {
      toast.error("No valid email addresses found");
    }
  };
  
  const handleExport = () => {
    let dataToExport = promoters;
    if (selectedIds.length > 0) {
      dataToExport = promoters.filter(p => selectedIds.includes(p.id));
    }
    
    const csvContent = [
      ["ID", "Name", "Contact", "Email", "District", "City"].join(","),
      ...dataToExport.map(p => [
        p.id,
        p.promoter_name,
        p.contact_number || 'NA',
        p.email_id || 'NA',
        p.district || 'NA',
        p.city || 'NA'
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `promoters_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${dataToExport.length} promoters`);
  };

  // Delete Handler
  const showDeleteConfirm = (id, name) => {
    setConfirmAction({
      type: 'delete',
      id,
      name
    });
    setIsConfirmModalOpen(true);
  };
  
  const handleDelete = async (id, name) => {
    setLoading(true);
    try {
      await databaseService.deletePromoterById(id);
      setPromoters((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      toast.success(`✅ "${name}" deleted.`);
    } catch (error) {
      toast.error("❌ Failed to delete promoter.");
    } finally {
      setLoading(false);
    }
  };
  
  const showBulkDeleteConfirm = () => {
    if (selectedIds.length === 0) {
      toast.info("Please select promoters first");
      return;
    }
    
    setConfirmAction({
      type: 'bulkDelete',
      count: selectedIds.length
    });
    setIsConfirmModalOpen(true);
  };
  
  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      // In a real app, you'd use a bulk delete endpoint
      for (const id of selectedIds) {
        await databaseService.deletePromoterById(id);
      }
      
      setPromoters((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      toast.success(`✅ ${selectedIds.length} promoters deleted.`);
    } catch (error) {
      toast.error("❌ Failed to delete some promoters.");
    } finally {
      setLoading(false);
    }
  };
  
  // Confirmation Modal Actions
  const confirmActionHandler = () => {
    if (!confirmAction) return;
    
    if (confirmAction.type === 'delete') {
      handleDelete(confirmAction.id, confirmAction.name);
    } else if (confirmAction.type === 'bulkDelete') {
      handleBulkDelete();
    }
    
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
  };
  
  const cancelActionHandler = () => {
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
  };

  // Filtered & Paginated Data - Memoized to improve performance
  const filteredPromoters = useMemo(() => {
    return sortedPromoters
      .filter((p) => p.promoter_name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((p) => !filters.district || p.district?.toLowerCase().includes(filters.district.toLowerCase()))
      .filter((p) => !filters.city || p.city?.toLowerCase().includes(filters.city.toLowerCase()))
      .filter((p) => !filters.contact_number || p.contact_number?.toLowerCase().includes(filters.contact_number.toLowerCase()))
      .filter((p) => !filters.email_id || p.email_id?.toLowerCase().includes(filters.email_id.toLowerCase()));
  }, [sortedPromoters, searchQuery, filters]);

  const indexOfLast = currentPage * promotersPerPage;
  const indexOfFirst = indexOfLast - promotersPerPage;
  const currentPromoters = filteredPromoters.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPromoters.length / promotersPerPage);
  
  // Get the different page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    if (currentPage > 2) pageNumbers.push(1);
    
    // Show ellipsis if needed
    if (currentPage > 3) pageNumbers.push('...');
    
    // Show previous page if not first
    if (currentPage > 1) pageNumbers.push(currentPage - 1);
    
    // Show current page
    pageNumbers.push(currentPage);
    
    // Show next page if not last
    if (currentPage < totalPages) pageNumbers.push(currentPage + 1);
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) pageNumbers.push('...');
    
    // Always show last page
    if (currentPage < totalPages - 1 && totalPages > 1) pageNumbers.push(totalPages);
    
    return pageNumbers;
  };
  
  // Generate tooltip for actions
  const getActionTooltip = (action, data = {}) => {
    const tooltips = {
      view: `View ${data.name || 'promoter'} details`,
      edit: `Edit ${data.name || 'promoter'} information`,
      whatsapp: data.contact ? `Send WhatsApp to ${data.contact}` : 'No contact available',
      mail: data.email ? `Send email to ${data.email}` : 'No email available',
      delete: `Delete ${data.name || 'promoter'}`
    };
    
    return tooltips[action] || '';
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className=" top-0  bg-white shadow px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#2F4C92]">
            <span className="hidden md:inline">Promoters</span>
            <span className="md:hidden">Promoters</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:inline-block">
              Last updated: {new Date().toLocaleDateString()}
            </span>
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FaBell className="text-gray-600 text-xl" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-[#5CAAAB] rounded-full flex items-center justify-center">
              <FaUserCircle className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col border-l-4 border-blue-500">
            <span className="text-gray-500 text-sm">Total Promoters</span>
            <div className="flex items-end mt-2">
              <span className="text-3xl font-bold text-gray-800">{stats.total}</span>
              <span className="ml-2 text-sm text-green-600">+{Math.floor(stats.total * 0.05)} this week</span>
            </div>
            <div className="mt-4 h-1 w-full bg-gray-100">
              <div className="h-1 bg-blue-500" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col border-l-4 border-green-500">
            <span className="text-gray-500 text-sm">Active Promoters</span>
            <div className="flex items-end mt-2">
              <span className="text-3xl font-bold text-gray-800">{stats.active}</span>
              <span className="ml-2 text-sm text-green-600">{Math.round(stats.active/stats.total*100)}% of total</span>
            </div>
            <div className="mt-4 h-1 w-full bg-gray-100">
              <div className="h-1 bg-green-500" style={{ width: `${Math.round(stats.active/stats.total*100)}%` }}></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col border-l-4 border-purple-500">
            <span className="text-gray-500 text-sm">New This Month</span>
            <div className="flex items-end mt-2">
              <span className="text-3xl font-bold text-gray-800">{stats.newThisMonth}</span>
              <span className="ml-2 text-sm text-blue-600 cursor-pointer hover:underline">View details</span>
            </div>
            <div className="mt-4 h-1 w-full bg-gray-100">
              <div className="h-1 bg-purple-500" style={{ width: `${Math.round(stats.newThisMonth/stats.total*100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Search & Control Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[250px]">
              <input
                type="text"
                placeholder="Search promoters..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-2.5 rounded-full border border-[#5CAAAB] font-medium text-zinc-500 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5CAAAB] transition duration-200"
              />
              <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#5CAAAB] text-base" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                >
                  <IoClose className="text-2xl" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition"
            >
              <FaFilter />
              Filters
              {Object.values(filters).some(f => f) && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
            
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition"
            >
              <FaFileExport />
              Export
            </button>
            
            {selectedIds.length > 0 && (
              <>
                <button
                  onClick={handleBulkMail}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition"
                >
                  <FaEnvelope />
                  Email Selected ({selectedIds.length})
                </button>
                
                <button
                  onClick={showBulkDeleteConfirm}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition"
                >
                  <FaTrash />
                  Delete Selected
                </button>
              </>
            )}
            
            <button
              onClick={handleNewPromoterClick}
              className="ml-auto flex items-center gap-2 bg-[#5CAAAB] text-white px-5 py-3 rounded-full font-semibold text-md shadow-md transition-all duration-200 hover:bg-[#489090] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#5CAAAB]"
            >
              <FaPlus className="text-base" />
              New Promoter
            </button>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-1">District</label>
                <Select
                  isClearable
                  options={districtOptions}
                  value={districtOptions.find((opt) => opt.value === filters.district)}
                  onChange={(option) => handleFilterChange("district", option ? option.value : "")}
                  placeholder="Select District"
                  className="rounded-md"
                  classNamePrefix="react-select"
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary: '#5CAAAB',
                    },
                  })}
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-1">City</label>
                <Select
                  isClearable
                  options={cityOptions}
                  value={cityOptions.find((opt) => opt.value === filters.city)}
                  onChange={(option) => handleFilterChange("city", option ? option.value : "")}
                  placeholder="Select City"
                  isDisabled={!filters.district}
                  className="rounded-md"
                  classNamePrefix="react-select"
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary: '#5CAAAB',
                    },
                  })}
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={filters.contact_number}
                  onChange={(e) => handleFilterChange("contact_number", e.target.value)}
                  placeholder="Search by phone"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5CAAAB]"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-1">Email</label>
                <input
                  type="text"
                  value={filters.email_id}
                  onChange={(e) => handleFilterChange("email_id", e.target.value)}
                  placeholder="Search by email"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5CAAAB]"
                />
              </div>
              
              <div className="col-span-1 md:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Promoters Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden promoter-table">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Promoter List</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {filteredPromoters.length} promoters found
              </span>
              <select 
                value={promotersPerPage} 
                onChange={(e) => {
                  setPromotersPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#5CAAAB]"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#5CAAAB] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Fetching promoter data...</p>
            </div>
          ) : currentPromoters.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <FaSearch className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-1">No promoters found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              {(searchQuery || Object.values(filters).some(f => f)) && (
                <button 
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-600 font-semibold">
                    <th className="p-3 w-12">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={
                          selectedIds.length === currentPromoters.length &&
                          currentPromoters.length !== 0
                        }
                        className="w-4 h-4 accent-[#5CAAAB] cursor-pointer"
                      />
                    </th>
                    <th className="p-3 cursor-pointer group" onClick={() => requestSort("id")}>
                      <div className="flex items-center">
                        ID
                        {sortConfig.key === "id" ? (
                          sortConfig.direction === "ascending" ? (
                            <FaSortUp className="ml-1 text-[#5CAAAB]" />
                          ) : (
                            <FaSortDown className="ml-1 text-[#5CAAAB]" />
                          )
                        ) : (
                          <FaSort className="ml-1 text-gray-300 group-hover:text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer group" onClick={() => requestSort("promoter_name")}>
                      <div className="flex items-center">
                        Name
                        {sortConfig.key === "promoter_name" ? (
                          sortConfig.direction === "ascending" ? (
                            <FaSortUp className="ml-1 text-[#5CAAAB]" />
                          ) : (
                            <FaSortDown className="ml-1 text-[#5CAAAB]" />
                          )
                        ) : (
                          <FaSort className="ml-1 text-gray-300 group-hover:text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer group" onClick={() => requestSort("email")}>
                      <div className="flex items-center">
                        Email
                        {sortConfig.key === "email" ? (
                          sortConfig.direction === "ascending" ? (
                            <FaSortUp className="ml-1 text-[#5CAAAB]" />
                          ) : (
                            <FaSortDown className="ml-1 text-[#5CAAAB]" />
                          )
                        ) : (
                          <FaSort className="ml-1 text-gray-300 group-hover:text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer group" onClick={() => requestSort("status")}>
                      <div className="flex items-center">
                        Status
                        {sortConfig.key === "status" ? (
                          sortConfig.direction === "ascending" ? (
                            <FaSortUp className="ml-1 text-[#5CAAAB]" />
                          ) : (
                            <FaSortDown className="ml-1 text-[#5CAAAB]" />
                          )
                        ) : (
                          <FaSort className="ml-1 text-gray-300 group-hover:text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer group" onClick={() => requestSort("campaigns")}>
                      <div className="flex items-center">
                        Campaigns
                        {sortConfig.key === "campaigns" ? (
                          sortConfig.direction === "ascending" ? (
                            <FaSortUp className="ml-1 text-[#5CAAAB]" />
                          ) : (
                            <FaSortDown className="ml-1 text-[#5CAAAB]" />
                          )
                        ) : (
                          <FaSort className="ml-1 text-gray-300 group-hover:text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer group" onClick={() => requestSort("last_active")}>
                      <div className="flex items-center">
                        Last Active
                        {sortConfig.key === "last_active" ? (
                          sortConfig.direction === "ascending" ? (
                            <FaSortUp className="ml-1 text-[#5CAAAB]" />
                          ) : (
                            <FaSortDown className="ml-1 text-[#5CAAAB]" />
                          )
                        ) : (
                          <FaSort className="ml-1 text-gray-300 group-hover:text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {currentPromoters.map((promoter) => (
                    <tr 
                      key={promoter.id} 
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(promoter.id)}
                          onChange={() => toggleSelect(promoter.id)}
                          className="w-4 h-4 accent-[#5CAAAB] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-500">{promoter.id}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium mr-3">
                            {promoter.promoter_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{promoter.promoter_name}</div>
                            <div className="text-xs text-gray-500">{promoter.company || 'Individual'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{promoter.email}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          promoter.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : promoter.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {promoter?.status?.charAt(0).toUpperCase() + promoter?.status?.slice(1)}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">
                        {promoter.campaigns > 0 ? (
                          <Link 
                            to={`/campaigns?promoter=${promoter.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {promoter.campaigns} {promoter.campaigns === 1 ? 'campaign' : 'campaigns'}
                          </Link>
                        ) : (
                          <span className="text-gray-400">No campaigns</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600">
                        {promoter.last_active ? (
                          <span title={new Date(promoter.last_active).toLocaleString()}>
                            {formatDistanceToNow(new Date(promoter.last_active), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleView(promoter.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title="View details"
                        >
                          <FaEye className="inline" />
                        </button>
                        <button
                          onClick={() => handleEdit(promoter.id)}
                          className="text-gray-400 hover:text-blue-600"
                          title="Edit promoter"
                        >
                          <FaEdit className="inline" />
                        </button>
                        <button
                          onClick={() => showDeleteConfirm(promoter.id, promoter.promoter_name)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete promoter"
                        >
                          <FaTrash className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

{/* 
<div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-md shadow-sm mt-4">

  <div className="flex items-center text-sm text-gray-600">
    Showing{" "}
    <span className="font-medium mx-1">
      {(currentPage - 1) * promotersPerPage + 1}
    </span>
    to
    <span className="font-medium mx-1">
      {Math.min(currentPage * promotersPerPage, filteredPromoters.length)}
    </span>
    of
    <span className="font-medium mx-1">{filteredPromoters.length}</span> promoters
  </div>

  <div className="flex space-x-2">
    <button
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 ${
        currentPage === 1
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      Previous
    </button>
    <span className="text-sm text-gray-700 flex items-center px-2">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 ${
        currentPage === totalPages
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      Next
    </button>
  </div>
</div> */}

{/* Pagination */}
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-md shadow-sm mt-4">
      {/* Pagination Info */}
      <div className="flex items-center text-sm text-gray-600">
        Showing{" "}
        <span className="font-medium mx-1">{indexOfFirst + 1}</span>
        to
        <span className="font-medium mx-1">
          {Math.min(indexOfLast, filteredPromoters.length)}
        </span>
        of
        <span className="font-medium mx-1">{filteredPromoters.length}</span> promoters
      </div>

      {/* Pagination Buttons */}
      <div className="flex space-x-2 items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Previous
        </button>

        {/* Render page numbers dynamically */}
        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <span key={index} className="px-2 text-gray-500 select-none">...</span>
          ) : (
            <button
              key={index}
              onClick={() => handlePageChange(page)}
              disabled={page === currentPage}
              className={`relative inline-flex items-center px-3 py-1 text-sm font-medium rounded-md border ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600 cursor-default"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>

            </div>
          )}

          {isConfirmModalOpen && confirmAction && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-[90%] max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Confirm {confirmAction.type === 'delete' ? 'Deletion' : 'Action'}</h2>
        <button onClick={() => setIsConfirmModalOpen(false)}><IoClose /></button>
      </div>
      <p>
        Are you sure you want to {confirmAction.type}{" "}
        <strong>{confirmAction.name || `${selectedIds.length} promoters`}</strong>?
      </p>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => setIsConfirmModalOpen(false)}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (confirmAction.type === 'delete') {
              handleDelete(confirmAction.id, confirmAction.name);
            } else {
              handleBulkDelete();
            }
            setIsConfirmModalOpen(false);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}

          </div> 
          </div>
        </div>
        )
}

export default PromotersPage;
