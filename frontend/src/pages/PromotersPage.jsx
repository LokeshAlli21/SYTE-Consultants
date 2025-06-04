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
import { IoClose, IoChevronDown } from "react-icons/io5";

import { toast } from "react-toastify";
import databaseService from "../backend-services/database/database";
import Select from "react-select";
import { UserProfile } from '../components/index';

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
      console.log(currentPromoters);
      
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
          <div className="flex items-center justify-between p-6 pb-0 gap-4 mr-6">
            <div className="px-6 flex-1">
              <h1 className="text-3xl font-bold text-[#2F4C92] mb-2">Promoters</h1>
              <p className="text-gray-500">Manage all promoters</p>
            </div>
            <div className="bg-teal-50 p-4 py-2 rounded-xl flex flex-row gap-2 border border-teal-200">
              <p className="text-2xl font-bold text-teal-600">
                {promoters.length}
              </p>
              <div className="flex items-center">
                <span className="text-sm font-medium text-teal-900">Total Promoters</span>
              </div>
            </div>
                        <UserProfile />
          </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">

        {/* Search & Control Bar */}
{/* Search & Control Bar */}
<div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
  <div className="flex flex-col lg:flex-row flex-wrap gap-4 items-center">

    {/* Search Bar */}
    <div className="relative flex-1 min-w-[250px]">
      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search promoters..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none transition-all duration-200"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
        >
          <IoClose size={20} />
        </button>
      )}
    </div>

    {/* Filters Toggle */}
    <button
      onClick={() => setShowFilters(!showFilters)}
      className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
        showFilters ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <FaFilter />
      Filters
      <IoChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
    </button>

    {/* Export Button */}
    {/* <button
      onClick={handleExport}
      disabled={loading}
      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2 transition-all duration-200"
    >
      <FaFileExport />
      Export
    </button> */}

    {/* Bulk Actions */}
    {selectedIds.length > 0 && (
      <>
        <span className="text-blue-600 bg-blue-50 px-6 py-3 rounded-xl font-medium">
          {selectedIds.length} selected
        </span>

        {/* <button
          onClick={handleBulkMail}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaEnvelope />
          Email
        </button> */}

        <button
          onClick={showBulkDeleteConfirm}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaTrash />
          Delete
        </button>
      </>
    )}

    {/* Add New Button */}
    <button
      onClick={handleNewPromoterClick}
      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      <FaPlus />
      New Promoter
    </button>
  </div>

  {/* Advanced Filters */}
  {showFilters && (
    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* District */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
  <Select
    isClearable
    options={districtOptions}
    value={districtOptions.find(opt => opt.value === filters.district)}
    onChange={(opt) => handleFilterChange("district", opt ? opt.value : "")}
    placeholder="Select District"
    classNamePrefix="react-select"
    theme={(theme) => ({
      ...theme,
      borderRadius: 8,
      colors: {
        ...theme.colors,
        primary: '#5CAAAB',
        primary25: '#e0f2f1', // light shade of the primary color
      },
    })}
    styles={{
      control: (base, state) => ({
        ...base,
        padding: '2px',
        borderWidth: '1px',
        borderColor: state.isFocused ? '#5CAAAB' : '#e5e7eb', // gray-200
        boxShadow: state.isFocused ? '0 0 0 2px #5CAAAB' : 'none',
        '&:hover': {
          borderColor: '#5CAAAB',
        },
        minHeight: '48px',
        borderRadius: '0.5rem', // rounded-lg
      }),
      placeholder: (base) => ({
        ...base,
        color: '#9ca3af', // text-gray-400
      }),
      singleValue: (base) => ({
        ...base,
        color: '#111827', // text-gray-900
      }),
    }}
  />
</div>

        {/* City */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
  <Select
    isClearable
    isDisabled={!filters.district}
    options={cityOptions}
    value={cityOptions.find(opt => opt.value === filters.city)}
    onChange={(opt) => handleFilterChange("city", opt ? opt.value : "")}
    placeholder="Select City"
    classNamePrefix="react-select"
    theme={(theme) => ({
      ...theme,
      borderRadius: 8,
      colors: {
        ...theme.colors,
        primary: '#5CAAAB',
        primary25: '#e0f2f1', // light shade of the primary color
      },
    })}
    styles={{
      control: (base, state) => ({
        ...base,
        padding: '2px',
        borderWidth: '1px',
        borderColor: state.isFocused ? '#5CAAAB' : '#e5e7eb', // gray-200
        boxShadow: state.isFocused ? '0 0 0 2px #5CAAAB' : 'none',
        '&:hover': {
          borderColor: '#5CAAAB',
        },
        minHeight: '48px',
        borderRadius: '0.5rem', // rounded-lg
      }),
      placeholder: (base) => ({
        ...base,
        color: '#9ca3af', // text-gray-400
      }),
      singleValue: (base) => ({
        ...base,
        color: '#111827', // text-gray-900
      }),
    }}
  />
</div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
          <input
            type="text"
            value={filters.contact_number}
            onChange={(e) => handleFilterChange("contact_number", e.target.value)}
            placeholder="Phone"
            className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="text"
            value={filters.email_id}
            onChange={(e) => handleFilterChange("email_id", e.target.value)}
            placeholder="Email"
            className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
          />
        </div>
      </div>

      {/* Clear Filters */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={clearFilters}
          className="text-gray-800 hover:text-[#5caaab] font-medium transition"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  )}
</div>
        {/* Promoters Table */}
<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden promoter-table">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Promoter List</h2>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-600 font-medium  px-3 py-1 rounded-full ">
                {filteredPromoters.length} promoters found
              </span>
              <select 
                value={promotersPerPage} 
                onChange={(e) => {
                  setPromotersPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all duration-200 bg-white hover:border-gray-300"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="py-24 text-center bg-gradient-to-b from-gray-50 to-white">
              <div className="inline-block w-10 h-10 border-4 border-[#5caaab] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-6 text-gray-600 font-medium">Fetching promoter data...</p>
            </div>
          ) : currentPromoters.length === 0 ? (
            <div className="py-20 text-center bg-gradient-to-b from-gray-50 to-white">
              <div className="w-20 h-20 mx-auto mb-6 text-gray-300 bg-gray-100 rounded-full flex items-center justify-center">
                <FaSearch className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No promoters found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              {(searchQuery || Object.values(filters).some(f => f)) && (
                <button 
                  onClick={clearFilters}
                  className="px-6 py-3 text-[#5caaab] hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium border-2 border-blue-200 hover:border-blue-300"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-100">
                  <tr className="text-left text-gray-700 font-semibold">
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={
                          selectedIds.length === currentPromoters.length &&
                          currentPromoters.length !== 0
                        }
                        className="w-4 h-4 accent-[#5caaab] cursor-pointer rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-100"
                      />
                    </th>
                    <th className="p-4 cursor-pointer group hover:bg-white transition-colors duration-200" onClick={() => requestSort("id")}>
                      <div className="flex items-center font-semibold text-gray-700">
                        ID
                        {sortConfig.key === "id" ? (
                          sortConfig.direction === "ascending" ? (
                            <FaSortUp className="ml-2 text-[#5caaab]" />
                          ) : (
                            <FaSortDown className="ml-2 text-[#5caaab]" />
                          )
                        ) : (
                          <FaSort className="ml-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 cursor-pointer group hover:bg-white transition-colors duration-200" onClick={() => requestSort("promoter_name")}>
                      <div className="flex items-center font-semibold text-gray-700">
                        Name
                        {sortConfig.key === "promoter_name" ? (
                          sortConfig.direction === "ascending" ? (
                            <FaSortUp className="ml-2 text-[#5caaab]" />
                          ) : (
                            <FaSortDown className="ml-2 text-[#5caaab]" />
                          )
                        ) : (
                          <FaSort className="ml-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 cursor-pointer group hover:bg-white transition-colors duration-200" onClick={() => requestSort("email_id")}>
                      <div className="flex items-center font-semibold text-gray-700">
                        Email
                        {sortConfig.key === "email_id" ? (
                          sortConfig.direction === "ascending" ? (
                            <FaSortUp className="ml-2 text-[#5caaab]" />
                          ) : (
                            <FaSortDown className="ml-2 text-[#5caaab]" />
                          )
                        ) : (
                          <FaSort className="ml-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 cursor-pointer group hover:bg-white transition-colors duration-200"  onClick={() => requestSort("contact_number")}>
                      <div className="flex items-center font-semibold text-gray-700">
                        Phone Number
                         {sortConfig.key === "contact_number" ? (
                          sortConfig.direction === "ascending" ? (
                            <FaSortUp className="ml-2 text-[#5caaab]" />
                          ) : (
                            <FaSortDown className="ml-2 text-[#5caaab]" />
                          )
                        ) : (
                          <FaSort className="ml-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 cursor-pointer group hover:bg-white transition-colors duration-200" onClick={() => requestSort("district")}>
                      <div className="flex items-center font-semibold text-gray-700">
                        District
                        {sortConfig.key === "district" ? (
                          sortConfig.direction === "ascending" ? (
                            <FaSortUp className="ml-2 text-[#5caaab]" />
                          ) : (
                            <FaSortDown className="ml-2 text-[#5caaab]" />
                          )
                        ) : (
                          <FaSort className="ml-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 cursor-pointer group hover:bg-white transition-colors duration-200" onClick={() => requestSort("city")}>
                      <div className="flex items-center font-semibold text-gray-700">
                        City
                        {sortConfig.key === "city" ? (
                          sortConfig.direction === "ascending" ? (
                            <FaSortUp className="ml-2 text-[#5caaab]" />
                          ) : (
                            <FaSortDown className="ml-2 text-[#5caaab]" />
                          )
                        ) : (
                          <FaSort className="ml-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentPromoters.map((promoter, index) => (
                    <tr 
                      key={promoter.id} 
                      className={`hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(promoter.id)}
                          onChange={() => toggleSelect(promoter.id)}
                          className="w-4 h-4 accent-[#5caaab] cursor-pointer rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                          {promoter.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm mr-4 shadow-md">
                            {promoter.promoter_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{promoter.promoter_name}</div>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                              {promoter.promoter_type || 'Individual'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 font-medium text-sm">{promoter.email_id}</td>
                      <td className="p-4 text-gray-700 font-medium text-sm">{promoter.contact_number}</td>
                      <td className="p-4 text-gray-700 font-medium text-sm">{promoter.district}</td>
                      <td className="p-4 text-gray-700 font-medium text-sm">{promoter.city}</td>
<td className="px-8 py-6 whitespace-nowrap">
  <div className="flex items-center justify-center">
    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
      {/* View */}
      <button
        title="View Promoter"
        onClick={() => handleView(promoter.id)}
        className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <FaEye className="w-3.5 h-3.5" />
      </button>

      {/* Edit */}
      <button
        title="Edit Promoter"
        onClick={() => handleEdit(promoter.id)}
        className="p-2.5 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <FaEdit className="w-3.5 h-3.5" />
      </button>

      {/* Delete */}
      <button
        title="Delete Promoter"
        onClick={() => showDeleteConfirm(promoter.id, promoter.promoter_name)}
        className="p-2.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <FaTrash className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</td>

                    </tr>
                  ))}
                </tbody>
              </table>

{/* Pagination */}
<div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200">
  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
    
    {/* Pagination Info */}
    <div className="text-sm text-gray-700">
      Showing{" "}
      <span className="font-semibold text-gray-900 px-2 py-0.5 rounded-md ">
        {indexOfFirst + 1}
      </span>{" "}
      to{" "}
      <span className="font-semibold text-gray-900 px-2 py-0.5 rounded-md ">
        {Math.min(indexOfLast, filteredPromoters.length)}
      </span>{" "}
      of{" "}
      <span className="font-semibold text-gray-900 px-2 py-0.5  rounded-md ">
        {filteredPromoters.length}
      </span>{" "}
      promoters
    </div>

    {/* Pagination Controls */}
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <span key={index} className="w-10 text-center text-gray-500">...</span>
        ) : (
          <button
            key={index}
            onClick={() => handlePageChange(page)}
            disabled={page === currentPage}
            className={`w-10 h-10 rounded-lg font-medium text-sm transition ${
              page === currentPage
                ? "bg-teal-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
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
