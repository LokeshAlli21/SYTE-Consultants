import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaPlus, 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSort, 
  FaSortUp, 
  FaSortDown,
  FaFilter,
  FaDownload,
  FaBars,
  FaTh
} from 'react-icons/fa';
import { IoClose, IoChevronDown } from "react-icons/io5";
import { toast } from "react-toastify";
import databaseService from '../../backend-services/database/database';
import {UnitDetailsForm} from '../index.js';
import { Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

function UnitDetails({
  disabled,
  setPrevProjectUnitDetails, 
  projectId, 
  setIsUnitDetailsFormActive, 
  isUnitDetailsFormActive,
  formData,
  setFormData,
  handleSubmitProjectUnit, 
  handleUpdateProjectUnit
}) {
  const [isDisabled, setIsDesabled] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);

  const [showForm, setShowForm] = useState(false);
const [editingUnit, setEditingUnit] = useState(null);
const [formErrors, setFormErrors] = useState({});
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [unitToDelete, setUnitToDelete] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    unitType: '',
    status: '',
    customerName: '',
    priceRange: { min: '', max: '' },
    areaRange: { min: '', max: '' }
  });

  // Filter options
  const statusOptions = [
    { value: 'Sold', label: 'Sold' },
    { value: 'Unsold', label: 'Unsold' },
    { value: 'Booked', label: 'Booked' },
    { value: 'Available', label: 'Available' }
  ];

  const unitTypeOptions = [
    { value: '1BHK', label: '1BHK' },
    { value: '2BHK', label: '2BHK' },
    { value: '3BHK', label: '3BHK' },
    { value: '4BHK', label: '4BHK' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Penthouse', label: 'Penthouse' },
    { value: 'Studio', label: 'Studio' }
  ];
const handleSubmit = (e) => {
  // Form submission logic
};

const confirmDelete = () => {
  // Delete confirmation logic  
};

const handleEditUnit = (unit) => {
  setEditingUnit(unit);
  setFormData(unit);
  setShowForm(true);
};

const handleDeleteUnit = (id) => {
  setUnitToDelete(id);
  setShowDeleteConfirm(true);
};
  // Fetch units data
  useEffect(() => {
    if(isUnitDetailsFormActive) return;
    
    const fetchUnits = async () => {
      if(projectId) {
        setLoading(true);
        try {
          const data = await databaseService.getAllUnitsForProject(projectId);
          setUnits(data);
        } catch (error) {
          toast.error("❌ Failed to load unit details");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUnits();
    setFormData(resetObjectData(formData));
  }, [isUnitDetailsFormActive, projectId]);

  function resetObjectData(obj) {
    if (Array.isArray(obj)) return [];
    
    const clearedObj = {};
    
    for (const key in obj) {
      const value = obj[key];
      
      if (key === 'project_id') {
        clearedObj[key] = value;
        continue;
      }
      
      if (typeof value === "string") {
        clearedObj[key] = "";
      } else if (typeof value === "number") {
        clearedObj[key] = '';
      } else if (typeof value === "boolean") {
        clearedObj[key] = false;
      } else if (Array.isArray(value)) {
        clearedObj[key] = [];
      } else if (typeof value === "object" && value !== null) {
        clearedObj[key] = resetObjectData(value);
      } else {
        clearedObj[key] = value;
      }
    }
    
    return clearedObj;
  }

  // Filtered and sorted units
  const filteredAndSortedUnits = useMemo(() => {
    let filtered = units.filter(unit => {
      const matchesSearch = 
        unit.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.unit_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUnitType = !filters.unitType || unit.unit_type?.toLowerCase() === filters.unitType.toLowerCase();
      const matchesStatus = !filters.status || unit.unit_status === filters.status;
      const matchesCustomer = !filters.customerName || 
        unit.customer_name?.toLowerCase().includes(filters.customerName.toLowerCase());

      // Price range filter
      let matchesPriceRange = true;
      if (filters.priceRange.min || filters.priceRange.max) {
        const price = unit.agreement_value || 0;
        if (filters.priceRange.min && price < parseFloat(filters.priceRange.min)) matchesPriceRange = false;
        if (filters.priceRange.max && price > parseFloat(filters.priceRange.max)) matchesPriceRange = false;
      }

      // Area range filter
      let matchesAreaRange = true;
      if (filters.areaRange.min || filters.areaRange.max) {
        const area = unit.carpet_area || 0;
        if (filters.areaRange.min && area < parseFloat(filters.areaRange.min)) matchesAreaRange = false;
        if (filters.areaRange.max && area > parseFloat(filters.areaRange.max)) matchesAreaRange = false;
      }

      return matchesSearch && matchesUnitType && matchesStatus && matchesCustomer && 
             matchesPriceRange && matchesAreaRange;
    });

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle null/undefined values
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [units, searchQuery, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUnits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUnits = filteredAndSortedUnits.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: units.length,
      sold: units.filter(u => u.unit_status === 'Sold').length,
      available: units.filter(u => u.unit_status === 'Unsold' || u.unit_status === 'Available').length,
      booked: units.filter(u => u.unit_status === 'Booked').length,
      totalRevenue: units.reduce((sum, u) => sum + (u.total_received || 0), 0),
      totalValue: units.reduce((sum, u) => sum + (u.agreement_value || 0), 0)
    };
  }, [units]);

  // Handlers
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    setSelectedIds(prev => 
      prev.length === currentUnits.length 
        ? [] 
        : currentUnits.map(u => u.id)
    );
  };

  const handleSelectItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const clearFilters = () => {
    setFilters({
      unitType: '',
      status: '',
      customerName: '',
      priceRange: { min: '', max: '' },
      areaRange: { min: '', max: '' }
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedIds.length} selected units?`);
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => databaseService.deleteProjectUnitById(id)));
      setUnits(prev => prev.filter(u => !selectedIds.includes(u.id)));
      setSelectedIds([]);
      toast.success(`✅ ${selectedIds.length} units deleted successfully.`);
    } catch (error) {
      console.error("Error deleting units:", error);
      toast.error("❌ Failed to delete units.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete unit "${name}"?`);
    if (!confirmDelete) return;
  
    setLoading(true);
    try {
      await databaseService.deleteProjectUnitById(id);
      setUnits(prev => prev.filter(unit => unit.id !== id));
      setSelectedIds(prev => prev.filter(unitId => unitId !== id));
      toast.success(`✅ Unit "${name}" deleted successfully.`);
    } catch (error) {
      toast.error("❌ Failed to delete unit.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setIsDesabled(false);
      const unit = await databaseService.getUnitById(id);
      
      if (unit) {
        setFormData(unit); 
        setPrevProjectUnitDetails(unit); 
        setCurrentUnitId(id);
        setIsUnitDetailsFormActive(true);
      } else {
        toast.error("❌ Unit not found");
      }
    } catch (error) {
      console.error("❌ Error fetching unit for edit:", error);
      toast.error("❌ Failed to load unit for editing.");
    }
  };
  
  const handleView = async (id) => {
    try {
      setIsDesabled(true);
      const unit = await databaseService.getUnitById(id);
      
      if (unit) {
        setFormData(unit);
        setIsUnitDetailsFormActive(true);
      } else {
        toast.error("❌ Unit not found");
      }
    } catch (error) {
      console.error("❌ Error fetching unit for view:", error);
      toast.error("❌ Failed to load unit for viewing.");
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'NA';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Sold': 'bg-green-100 text-green-800',
      'Unsold': 'bg-red-100 text-red-800', 
      'Booked': 'bg-blue-100 text-blue-800',
      'Available': 'bg-yellow-100 text-yellow-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-teal-600" />
      : <FaSortDown className="text-teal-600" />;
  };

  if(!projectId) return null;

  if(isUnitDetailsFormActive) {
    return (
      <UnitDetailsForm
        setIsUnitDetailsFormActive={setIsUnitDetailsFormActive}
        formData={formData}
        disabled={isDisabled}
        setFormData={setFormData}
        currentUnitId={currentUnitId}
        setCurrentUnitId={setCurrentUnitId}
        setIsDesabled={setIsDesabled}
        handleUpdateProjectUnit={handleUpdateProjectUnit}
        handleSubmitProjectUnit={handleSubmitProjectUnit}
      />
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="p-6 pt-0 mb-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2F4C92] mb-2">Unit Management</h1>
              <p className="text-gray-500">Manage and monitor all project units efficiently</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-xl flex flex-row gap-4 border border-teal-200">
              <p className="text-2xl font-bold text-teal-600 mt-1">
                {filteredAndSortedUnits.length}
              </p>
              <div className="flex items-center">
                <span className="text-sm font-medium text-teal-900">Total Units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sold Units</p>
                <p className="text-2xl font-bold text-green-600">{stats.sold}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Units</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.available}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <div className="w-6 h-6 bg-purple-600 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search units, types, or customers..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 transition-all duration-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <IoClose size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <>
                <span className="text-blue-600 px-6 py-3 rounded-xl font-medium bg-blue-50 transition-all duration-200">
                  {selectedIds.length} unit{selectedIds.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <FaTrash className="text-lg" />
                    Delete
                  </button>
                </div>
              </>
            )}

            {/* Filter Toggle */}
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

            {!disabled && (
              <button
                onClick={() => setIsUnitDetailsFormActive(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaPlus />
                New Unit
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Unit Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Type</label>
                  <select
                    value={filters.unitType}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, unitType: e.target.value }));
                      setCurrentPage(1);
                    }}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                  >
                    <option value="">All Types</option>
                    {unitTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, status: e.target.value }));
                      setCurrentPage(1);
                    }}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                  >
                    <option value="">All Status</option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Customer Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                  <input
                    type="text"
                    value={filters.customerName}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, customerName: e.target.value }));
                      setCurrentPage(1);
                    }}
                    placeholder="Search customer name"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                  />
                </div>

                {/* Price Range */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.priceRange.min}
                      onChange={(e) => {
                        setFilters(prev => ({ 
                          ...prev, 
                          priceRange: { ...prev.priceRange, min: e.target.value }
                        }));
                        setCurrentPage(1);
                      }}
                      placeholder="Min price"
                      className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                    />
                    <input
                      type="number"
                      value={filters.priceRange.max}
                      onChange={(e) => {
                        setFilters(prev => ({ 
                          ...prev, 
                          priceRange: { ...prev.priceRange, max: e.target.value }
                        }));
                        setCurrentPage(1);
                      }}
                      placeholder="Max price"
                      className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                    />
                  </div>
                </div>

                {/* Area Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area Range (sq ft)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.areaRange.min}
                      onChange={(e) => {
                        setFilters(prev => ({ 
                          ...prev, 
                          areaRange: { ...prev.areaRange, min: e.target.value }
                        }));
                        setCurrentPage(1);
                      }}
                      placeholder="Min area"
                      className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                    />
                    <input
                      type="number"
                      value={filters.areaRange.max}
                      onChange={(e) => {
                        setFilters(prev => ({ 
                          ...prev, 
                          areaRange: { ...prev.areaRange, max: e.target.value }
                        }));
                        setCurrentPage(1);
                      }}
                      placeholder="Max area"
                      className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-[#5caaab] font-medium"
                >
                  Clear All Filters
                </button>
                <span className="text-sm text-gray-500">
                  {filteredAndSortedUnits.length} of {units.length} units shown
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          
          {/* Table Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Unit List</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-4 text-gray-500">Loading units...</p>
            </div>
          ) : filteredAndSortedUnits.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FaSearch size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No units found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
              {(searchQuery || Object.values(filters).some(f => 
                typeof f === 'string' ? f !== '' : 
                typeof f === 'object' ? Object.values(f).some(v => v !== '') : 
                false
              )) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 w-12">
                      <input
                        disabled={disabled}
                        type="checkbox"
                        checked={selectedIds.length === currentUnits.length && currentUnits.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 accent-[#5caaab] text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                    </th>
                    <th className="p-4 text-left">
                      <button
                        onClick={() => handleSort('unit_name')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-teal-600"
                      >
                        Unit Name
                        {getSortIcon('unit_name')}
                      </button>
                    </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('unit_type')}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-teal-600"
                  >
                    Type
                    {getSortIcon('unit_type')}
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('description')}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-teal-600"
                  >
                    Description
                    {getSortIcon('description')}
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('location')}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-teal-600"
                  >
                    Location
                    {getSortIcon('location')}
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('is_occupied')}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-teal-600"
                  >
                    Status
                    {getSortIcon('is_occupied')}
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('monthly_rent')}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-teal-600"
                  >
                    Monthly Rent
                    {getSortIcon('monthly_rent')}
                  </button>
                </th>
                <th className="p-4 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUnits.map((unit, index) => (
                <tr key={unit.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="p-4">
                    <input
                      disabled={disabled}
                      type="checkbox"
                      checked={selectedIds.includes(unit.id)}
                      onChange={() => handleSelectUnit(unit.id)}
                      className="w-4 h-4 accent-[#5caaab] text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </td>
                  <td className="p-4 font-medium text-gray-900">{unit.unit_name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      unit.unit_type === 'apartment' ? 'bg-blue-100 text-blue-800' :
                      unit.unit_type === 'house' ? 'bg-green-100 text-green-800' :
                      unit.unit_type === 'studio' ? 'bg-purple-100 text-purple-800' :
                      unit.unit_type === 'condo' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {unit.unit_type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 max-w-xs truncate">{unit.description || 'No description'}</td>
                  <td className="p-4 text-gray-600">{unit.location}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      unit.is_occupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {unit.is_occupied ? 'Occupied' : 'Available'}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">${unit.monthly_rent?.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        disabled={disabled}
                        onClick={() => handleEditUnit(unit)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit unit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        disabled={disabled}
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete unit"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUnits.length)} of {filteredUnits.length} units
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm border rounded ${
                  currentPage === page
                    ? 'bg-teal-500 text-white border-teal-500'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Unit Form Modal */}
      {isUnitDetailsFormActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUnit ? 'Edit Unit' : 'Add New Unit'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingUnit(null);
                  setFormData({
                    unit_name: '',
                    unit_type: 'apartment',
                    description: '',
                    location: '',
                    monthly_rent: '',
                    is_occupied: false
                  });
                  setFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Name *
                </label>
                <input
                  type="text"
                  value={formData.unit_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    formErrors.unit_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Unit 101, Apartment A"
                />
                {formErrors.unit_name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.unit_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Type *
                </label>
                <select
                  value={formData.unit_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="condo">Condo</option>
                  <option value="room">Room</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the unit..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    formErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 123 Main St, Building A"
                />
                {formErrors.location && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent *
                </label>
                <input
                  type="number"
                  value={formData.monthly_rent}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_rent: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    formErrors.monthly_rent ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {formErrors.monthly_rent && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.monthly_rent}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_occupied"
                  checked={formData.is_occupied}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_occupied: e.target.checked }))}
                  className="w-4 h-4 accent-[#5caaab] text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="is_occupied" className="ml-2 text-sm text-gray-700">
                  Currently Occupied
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUnit(null);
                    setFormData({
                      unit_name: '',
                      unit_type: 'apartment',
                      description: '',
                      location: '',
                      monthly_rent: '',
                      is_occupied: false
                    });
                    setFormErrors({});
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : editingUnit ? 'Update Unit' : 'Add Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the selected unit(s)? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUnitToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default UnitDetails