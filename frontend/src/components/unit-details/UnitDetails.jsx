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
import {
  Building2, CheckCircle, Clock, BookOpen, DollarSign, TrendingUp, AlertCircle,
  Lock, CalendarCheck, Hammer, Ban, Tag
} from 'lucide-react';
import { IoClose, IoChevronDown } from "react-icons/io5";
import { toast } from "react-toastify";
import databaseService from '../../backend-services/database/database';
import { UnitDetailsForm } from '../index.js';

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
  
  // Filters
  const [filters, setFilters] = useState({
    unitType: '',
    status: '',
    minArea: '',
    maxArea: '',
    minPrice: '',
    maxPrice: ''
  });

  const unitTypeOptions = [
    { value: "1 BHK", label: "1 BHK" },
    { value: "2 BHK", label: "2 BHK" },
    { value: "3 BHK", label: "3 BHK" },
    { value: "4 BHK", label: "4 BHK" },
    { value: "Duplex", label: "Duplex" },
    { value: "Office Space", label: "Office Space" },
    { value: "Other", label: "Other" },
    { value: "5 BHK", label: "5 BHK" },
    { value: "6 BHK", label: "6 BHK" },
    { value: "Bunglow", label: "Bunglow" },
    { value: "Shops", label: "Shops" },
    { value: "Showroom", label: "Showroom" },
    { value: "Hall", label: "Hall" },
    { value: "Amenity", label: "Amenity" },
    { value: "Multi Purpose Room", label: "Multi Purpose Room" },
    { value: "1 Room Kitchen", label: "1 Room Kitchen" },
    { value: "Row Houses", label: "Row Houses" },
  ];

  const statusOptions = [
    { value: "Sold", label: "Sold" },
    { value: "Unsold", label: "Unsold" },
    { value: "Booked", label: "Booked" },
    { value: "Mortgage", label: "Mortgage" },
    { value: "Reservation", label: "Reservation" },
    { value: "Rehab", label: "Rehab" },
    {
      value: "Land Owner/Investor Share (Not for Sale)",
      label: "Land Owner/Investor Share (Not for Sale)",
    },
    {
      value: "Land Owner/Investor Share (for Sale)",
      label: "Land Owner/Investor Share (for Sale)",
    },
  ];

  // Fetch units
  useEffect(() => {
    if(isUnitDetailsFormActive) return;
    
    const fetchUnits = async () => {
      if(projectId) {
        setLoading(true);
        try {
          const data = await databaseService.getAllUnitsForProject(projectId);
          console.log(data);
          
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

  // Filter and sort units
  const filteredAndSortedUnits = useMemo(() => {
    let filtered = units.filter(unit => {
      const matchesSearch = 
        unit.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.unit_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUnitType = !filters.unitType || unit.unit_type?.toLowerCase() === filters.unitType.toLowerCase();
      const matchesStatus = !filters.status || unit.unit_status?.toLowerCase() === filters.status.toLowerCase();
      
      const matchesMinArea = !filters.minArea || (unit.carpet_area && parseFloat(unit.carpet_area) >= parseFloat(filters.minArea));
      const matchesMaxArea = !filters.maxArea || (unit.carpet_area && parseFloat(unit.carpet_area) <= parseFloat(filters.maxArea));
      
      const matchesMinPrice = !filters.minPrice || (unit.agreement_value && parseFloat(unit.agreement_value) >= parseFloat(filters.minPrice));
      const matchesMaxPrice = !filters.maxPrice || (unit.agreement_value && parseFloat(unit.agreement_value) <= parseFloat(filters.maxPrice));

      return (
        matchesSearch &&
        matchesUnitType &&
        matchesStatus &&
        matchesMinArea &&
        matchesMaxArea &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle null/undefined values
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';
        
        // Handle numeric values
        if (sortConfig.key === 'carpet_area' || sortConfig.key === 'agreement_value' || sortConfig.key === 'total_received' || sortConfig.key === 'balance_amount') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else if (typeof aValue === 'string') {
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

  // Stats calculations
const stats = useMemo(() => {
  const totalUnits = units.length;
  const totalRevenue = units.reduce((sum, u) => sum + (parseFloat(u.total_received) || 0), 0);
  const totalValue = units.reduce((sum, u) => sum + (parseFloat(u.agreement_value) || 0), 0);
  const balanceAmount = units.reduce((sum, u) => sum + (parseFloat(u.balance_amount) || 0), 0);

  const statusCounts = {};
  statusOptions.forEach(({ value }) => {
    statusCounts[value] = units.filter(u => u.unit_status === value).length;
  });

  // Calculate availableUnits: a combination of Available/Unsold
  const availableUnits = statusCounts['Unsold'] || 0;

  return {
    totalUnits,
    totalRevenue,
    totalValue,
    balanceAmount,
    ...statusCounts,
    availableUnits
  };
}, [units]);

const statusCardStyles = {
  Sold: {
    icon: CheckCircle,
    color: 'text-green-700',
    bgGradient: 'from-green-50 to-green-100',
    iconBg: 'bg-green-500'
  },
  Unsold: {
    icon: Clock,
    color: 'text-amber-700',
    bgGradient: 'from-amber-50 to-amber-100',
    iconBg: 'bg-amber-500'
  },
  Booked: {
    icon: BookOpen,
    color: 'text-indigo-700',
    bgGradient: 'from-indigo-50 to-indigo-100',
    iconBg: 'bg-indigo-500'
  },
  Mortgage: {
    icon: Lock,
    color: 'text-yellow-700',
    bgGradient: 'from-yellow-50 to-yellow-100',
    iconBg: 'bg-yellow-500'
  },
  Reservation: {
    icon: CalendarCheck,
    color: 'text-blue-700',
    bgGradient: 'from-blue-50 to-blue-100',
    iconBg: 'bg-blue-500'
  },
  Rehab: {
    icon: Hammer,
    color: 'text-orange-700',
    bgGradient: 'from-orange-50 to-orange-100',
    iconBg: 'bg-orange-500'
  },
  "Land Owner/Investor Share (Not for Sale)": {
    icon: Ban,
    color: 'text-gray-700',
    bgGradient: 'from-gray-50 to-gray-100',
    iconBg: 'bg-gray-500'
  },
  "Land Owner/Investor Share (for Sale)": {
    icon: Tag,
    color: 'text-teal-700',
    bgGradient: 'from-teal-50 to-teal-100',
    iconBg: 'bg-teal-500'
  },
};


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
      minArea: '',
      maxArea: '',
      minPrice: '',
      maxPrice: ''
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


  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getPercentage = (value, total) => {
    return ((value / total) * 100).toFixed(1);
  };

const cardData = [
  {
    title: 'Total Units',
    value: formatNumber(stats.totalUnits),
    icon: Building2,
    color: 'blue',
    bgGradient: 'from-blue-50 to-blue-100',
    iconBg: 'bg-blue-500',
    textColor: 'text-blue-700',
    subtitle: 'Unites listed'
  },
  {
    title: 'Total Value',
    value: formatCurrency(stats.totalValue),
    icon: () => <span className="text-2xl font-medium p-0 text-white">₹</span>,
    color: 'purple',
    bgGradient: 'from-purple-50 to-purple-100',
    iconBg: 'bg-purple-500',
    textColor: 'text-purple-700',
    subtitle: 'Total worth',
    isLarge: true
  },
  {
    title: 'Revenue',
    value: formatCurrency(stats.totalRevenue),
    icon: TrendingUp,
    color: 'emerald',
    bgGradient: 'from-emerald-50 to-emerald-100',
    iconBg: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    subtitle: 'Total Amount received',
    trend: '+15%',
    isLarge: true
  },
  {
    title: 'Balance Due',
    value: formatCurrency(stats.balanceAmount),
    icon: AlertCircle,
    color: 'rose',
    bgGradient: 'from-rose-50 to-rose-100',
    iconBg: 'bg-rose-500',
    textColor: 'text-rose-700',
    subtitle: 'Pending amount',
    isLarge: true
  },
  {
    title: 'Unsold',
    value: formatNumber(stats.availableUnits),
    icon: Clock,
    color: 'amber',
    bgGradient: 'from-amber-50 to-amber-100',
    iconBg: 'bg-amber-500',
    textColor: 'text-amber-700',
    subtitle: `${getPercentage(stats.availableUnits, stats.totalUnits)}% Unsold`
  },
  // Dynamically add status cards
  ...statusOptions.map(({ value: status }) => {
    const count = stats[status] || 0;
    const style = statusCardStyles[status] || {};
    return {
      title: status,
      value: formatNumber(count),
      icon: style.icon || AlertCircle,
      color: style.color || 'slate',
      bgGradient: `${style.bgGradient}`,
      iconBg: `${style.iconBg || 'slate'}`,
      textColor: `text-${style.bg || 'slate'}-700`,
      subtitle: `${getPercentage(count, stats.totalUnits)}% of total`
    };
  })
];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="py-6 pt-0 mb-0">
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
<div className="flex max-w-6xl gap-4 overflow-x-scroll py-4 mb-4" style={{
    scrollbarWidth: 'none',        // Firefox
    msOverflowStyle: 'none'        // IE 10+
  }}>
      {cardData.map((card, index) => (
        <div
          key={index}
          className={`
            min-w-[200px]
            group relative overflow-hidden rounded-2xl shadow-sm border border-gray-200/50 
            bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm
            hover:shadow-lg hover:shadow-${card.color}-500/10 hover:-translate-y-1 
            transition-all duration-300 cursor-pointer
            ${card.isLarge ? 'md:col-span-1' : ''}
          `}
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-grid-pattern"></div>
          </div>
          
          <div className="relative p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-bold ${card.textColor} group-hover:scale-105 transition-transform duration-200`}>
                    {card.value}
                  </p>
                  {card.trend && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/50 text-green-700">
                      ↗ {card.trend}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={`
                ${card.iconBg} p-3 rounded-xl shadow-sm
                group-hover:scale-110 group-hover:rotate-3 
                transition-all duration-300
              `}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {card.subtitle && (
              <p className="text-xs text-gray-600 font-medium">
                {card.subtitle}
              </p>
            )}
            
            {/* Progress bar for percentage-based cards */}
            {(card.title === 'Sold' || card.title === 'Available' || card.title === 'Booked') && (
              <div className="mt-3">
                <div className="w-full bg-white/60 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full bg-gradient-to-r ${
                      card.color === 'green' ? 'from-green-400 to-green-600' :
                      card.color === 'amber' ? 'from-amber-400 to-amber-600' :
                      'from-indigo-400 to-indigo-600'
                    } transition-all duration-1000`}
                    style={{
                      width: `${
                        card.title === 'Sold' ? getPercentage(stats.soldUnits, stats.totalUnits) :
                        card.title === 'Available' ? getPercentage(stats.availableUnits, stats.totalUnits) :
                        getPercentage(stats.bookedUnits, stats.totalUnits)
                      }%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      ))}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                
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

                {/* Min Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Area (sq ft)</label>
                  <input
                    type="number"
                    value={filters.minArea}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, minArea: e.target.value }));
                      setCurrentPage(1);
                    }}
                    placeholder="Min area"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                  />
                </div>

                {/* Max Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Area (sq ft)</label>
                  <input
                    type="number"
                    value={filters.maxArea}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, maxArea: e.target.value }));
                      setCurrentPage(1);
                    }}
                    placeholder="Max area"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                  />
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₹)</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, minPrice: e.target.value }));
                      setCurrentPage(1);
                    }}
                    placeholder="Min price"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₹)</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, maxPrice: e.target.value }));
                      setCurrentPage(1);
                    }}
                    placeholder="Max price"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                  />
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
              {(searchQuery || Object.values(filters).some(f => f !== '' && f !== null)) && (
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
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('unit_name')}
                    >
                      <div className="flex items-center gap-2">
                        Unit Name
                        {getSortIcon('unit_name')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('unit_type')}
                    >
                      <div className="flex items-center gap-2">
                        Type
                        {getSortIcon('unit_type')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('carpet_area')}
                    >
                      <div className="flex items-center gap-2">
                        Area (sq ft)
                        {getSortIcon('carpet_area')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('unit_status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {getSortIcon('unit_status')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('customer_name')}
                    >
                      <div className="flex items-center gap-2">
                        Customer
                        {getSortIcon('customer_name')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('agreement_value')}
                    >
                      <div className="flex items-center gap-2">
                        Agreement Value
                        {getSortIcon('agreement_value')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total_received')}
                    >
                      <div className="flex items-center gap-2">
                        Received
                        {getSortIcon('total_received')}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('balance_amount')}
                    >
                      <div className="flex items-center gap-2">
                        Balance
                        {getSortIcon('balance_amount')}
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentUnits.map((unit, index) => (
                    <tr 
                      key={unit.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedIds.includes(unit.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          disabled={disabled}
                          type="checkbox"
                          checked={selectedIds.includes(unit.id)}
                          onChange={() => handleSelectItem(unit.id)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="p-4 flex flex-col items-center">
                        <div className="font-medium text-gray-900">
                          {unit.unit_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 text-center flex flex-row items-center justify-center gap-2 w-full">
                          <p className=''>ID: </p> <p className=' px-1.5 text-center bg-zinc-200 rounded'> {unit.id || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {unit.unit_type || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        {unit.carpet_area ? `${unit.carpet_area} sq ft` : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(unit.unit_status)}`}>
                          {unit.unit_status || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-900">
                          {unit.customer_name || 'N/A'}
                        </div>
                        {unit.customer_mobile && (
                          <div className="text-sm text-gray-500">
                            {unit.customer_mobile}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-gray-900 font-medium">
                        {formatCurrency(unit.agreement_value)}
                      </td>
                      <td className="p-4 text-green-600 font-medium">
                        {formatCurrency(unit.total_received)}
                      </td>
                      <td className="p-4 text-red-600 font-medium">
                        {formatCurrency(unit.balance_amount)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(unit.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Unit"
                          >
                            <FaEye />
                          </button>
                          {!disabled && (
                            <>
                              <button
                                onClick={() => handleEdit(unit.id)}
                                className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                                title="Edit Unit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(unit.id, unit.unit_name)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete Unit"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredAndSortedUnits.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedUnits.length)} of {filteredAndSortedUnits.length} units
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-teal-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UnitDetails;