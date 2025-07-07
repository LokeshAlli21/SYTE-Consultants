import React, { useEffect, useState, useMemo } from 'react'
import {
  Building2, CheckCircle, Clock, BookOpen, DollarSign, TrendingUp, AlertCircle,
  Lock, CalendarCheck, Hammer, Ban, Tag, IndianRupee, Search, Filter, 
  ArrowUpRight, Eye, MoreVertical, ChevronRight, Home, MapPin, Plus,
  Grid3X3, List, SlidersHorizontal, X
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import databaseService from '../backend-services/database/database';

function Units() {
  const [units, setUnits] = useState([])
  
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false)

  const {projectId} = useParams()
  const navigate = useNavigate()
  
  useEffect(() => {
    // Simulate API call
    const fetchProjectUnits = async () => {
      try {
        setLoading(true)
        // Replace with actual API call
        const result = await databaseService.getProjectUnits(projectId)
        setUnits(result)
      } catch (error) {
        console.error("Error fetching units:", error)
        setUnits([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjectUnits()
  }, [projectId])
  
  const statusOptions = [
    { value: "All", label: "All Status", count: 0 },
    { value: "Sold", label: "Sold", count: 0 },
    { value: "Unsold", label: "Unsold", count: 0 },
    { value: "Booked", label: "Booked", count: 0 },
    { value: "Mortgage", label: "Mortgage", count: 0 },
    { value: "Reservation", label: "Reservation", count: 0 },
    { value: "Rehab", label: "Rehab", count: 0 }
  ];

  const filteredUnits = useMemo(() => {
    if (!units || !Array.isArray(units)) return [];
    
    return units.filter(unit => {
      const matchesSearch = unit.unit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           unit.unit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (unit.customer_name && unit.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || unit.unit_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [units, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    if (!units || !Array.isArray(units)) {
      return {
        totalUnits: 0,
        totalRevenue: 0,
        totalValue: 0,
        balanceAmount: 0,
        collectionRate: 0,
        statusCounts: { All: 0, Sold: 0, Unsold: 0, Booked: 0, Mortgage: 0, Reservation: 0, Rehab: 0 }
      };
    }
    
    const totalUnits = units.length;
    const totalRevenue = units.reduce((sum, u) => sum + (parseFloat(u.total_received) || 0), 0);
    const totalValue = units.reduce((sum, u) => sum + (parseFloat(u.agreement_value) || 0), 0);
    const balanceAmount = units.reduce((sum, u) => sum + (parseFloat(u.balance_amount) || 0), 0);

    const statusCounts = {};
    statusOptions.forEach(({ value }) => {
      statusCounts[value] = value === 'All' ? totalUnits : units.filter(u => u.unit_status === value).length;
    });

    return {
      totalUnits,
      totalRevenue,
      totalValue,
      balanceAmount,
      collectionRate: totalValue > 0 ? (totalRevenue / totalValue) * 100 : 0,
      statusCounts
    };
  }, [units]);

  const statusColors = {
    'Sold': { 
      bg: 'bg-emerald-500', 
      text: 'text-emerald-700', 
      light: 'bg-emerald-50',
      border: 'border-emerald-200',
      dot: 'bg-emerald-400'
    },
    'Unsold': { 
      bg: 'bg-orange-500', 
      text: 'text-orange-700', 
      light: 'bg-orange-50',
      border: 'border-orange-200',
      dot: 'bg-orange-400'
    },
    'Booked': { 
      bg: 'bg-blue-500', 
      text: 'text-blue-700', 
      light: 'bg-blue-50',
      border: 'border-blue-200',
      dot: 'bg-blue-400'
    },
    'Mortgage': { 
      bg: 'bg-purple-500', 
      text: 'text-purple-700', 
      light: 'bg-purple-50',
      border: 'border-purple-200',
      dot: 'bg-purple-400'
    },
    'Reservation': { 
      bg: 'bg-indigo-500', 
      text: 'text-indigo-700', 
      light: 'bg-indigo-50',
      border: 'border-indigo-200',
      dot: 'bg-indigo-400'
    },
    'Rehab': { 
      bg: 'bg-amber-500', 
      text: 'text-amber-700', 
      light: 'bg-amber-50',
      border: 'border-amber-200',
      dot: 'bg-amber-400'
    }
  };

  const formatCurrency = (value) => {
    if (!value || value === 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const handleUnitClick = (unitId) => {
    console.log('Navigate to unit:', unitId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-6">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-6 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-2xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Units</h1>
                <p className="text-white/80 text-sm">Property Management</p>
              </div>
            </div>
            <button className="bg-white/20 backdrop-blur-sm p-2.5 rounded-2xl hover:bg-white/30 transition-colors">
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/80 uppercase tracking-wider">Revenue</span>
              </div>
              <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-white/60 mt-1">{stats.collectionRate.toFixed(1)}% collected</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/80 uppercase tracking-wider">Total Units</span>
              </div>
              <p className="text-xl font-bold">{formatNumber(stats.totalUnits)}</p>
              <p className="text-xs text-white/60 mt-1">{formatCurrency(stats.totalValue)} worth</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'Sold', icon: CheckCircle, label: 'Sold' },
          { key: 'Unsold', icon: AlertCircle, label: 'Available' },
          { key: 'Booked', icon: Clock, label: 'Booked' }
        ].map(({ key, icon: Icon, label }) => {
          const count = stats.statusCounts[key] || 0;
          const colors = statusColors[key];
          const percentage = stats.totalUnits > 0 ? ((count / stats.totalUnits) * 100).toFixed(0) : 0;
          
          return (
            <div key={key} className={`${colors.light} ${colors.border} border rounded-2xl p-4 relative overflow-hidden`}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${colors.bg} p-2 rounded-xl`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-xs font-medium ${colors.text}`}>{percentage}%</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-600">{label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search units..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl transition-colors ${showFilters ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-600'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {showFilters && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Filter by Status</span>
              {statusFilter !== 'All' && (
                <button
                  onClick={() => setStatusFilter('All')}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(option => {
                const count = stats.statusCounts[option.value] || 0;
                const isActive = statusFilter === option.value;
                const colors = statusColors[option.value];
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? colors?.bg + ' text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option.label} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredUnits.length} of {stats.totalUnits} units
        </p>
        <div className="flex items-center bg-gray-50 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Units List */}
      <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 gap-4' : 'space-y-3'}`}>
        {filteredUnits.length > 0 ? (
          filteredUnits.map((unit) => {
            const colors = statusColors[unit.unit_status] || statusColors['Unsold'];
            const completionPercentage = ((unit.total_received / unit.agreement_value) * 100).toFixed(0);
            
            return (
              <div
                key={unit.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => handleUnitClick(unit.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${colors.light} p-3 rounded-xl`}>
                      <Home className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{unit.unit_name}</h3>
                      <p className="text-sm text-gray-600">{unit.unit_type} • {unit.carpet_area} sq ft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${colors.text} ${colors.light}`}>
                      {unit.unit_status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Value</p>
                    <p className="font-bold text-gray-900">{formatCurrency(unit.agreement_value)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Received</p>
                    <p className="font-bold text-emerald-600">{formatCurrency(unit.total_received)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Payment Progress</span>
                    <span className="text-xs font-medium text-gray-700">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {unit.customer_name && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {unit.customer_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{unit.customer_name}</p>
                        <p className="text-xs text-gray-500">Customer</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                )}

                {!unit.customer_name && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-500">No customer assigned</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-50 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No units found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Units