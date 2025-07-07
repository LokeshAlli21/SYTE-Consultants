import React, { useEffect, useState, useMemo } from 'react'
import {
  Building2, CheckCircle, Clock, BookOpen, DollarSign, TrendingUp, AlertCircle,
  Lock, CalendarCheck, Hammer, Ban, Tag, IndianRupee, Search, Filter, 
  ArrowUpRight, Eye, MoreVertical, ChevronRight, Home, MapPin, Zap, Target
} from 'lucide-react';
import databaseService from '../backend-services/database/database';
import { useParams } from 'react-router-dom';

function Units() {
  const {projectId} = useParams()
  
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  
  useEffect(() => {
    const fetchProjectUnits = async () => {
      try {
        setLoading(true)
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
    { value: "All", label: "All Status" },
    { value: "Sold", label: "Sold" },
    { value: "Unsold", label: "Available" },
    { value: "Booked", label: "Booked" },
    { value: "Mortgage", label: "Mortgage" },
    { value: "Reservation", label: "Reserved" },
    { value: "Rehab", label: "Rehab" },
    { value: "Land Owner/Investor Share (Not for Sale)", label: "Investor Share" },
    { value: "Land Owner/Investor Share (for Sale)", label: "Investor (Sale)" },
  ];

  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      const matchesSearch = unit.unit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           unit.unit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (unit.customer_name && unit.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || unit.unit_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [units, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalUnits = units.length;
    const totalRevenue = units.reduce((sum, u) => sum + (parseFloat(u.total_received) || 0), 0);
    const totalValue = units.reduce((sum, u) => sum + (parseFloat(u.agreement_value) || 0), 0);
    const balanceAmount = units.reduce((sum, u) => sum + (parseFloat(u.balance_amount) || 0), 0);

    const statusCounts = {};
    statusOptions.forEach(({ value }) => {
      if (value !== 'All') {
        statusCounts[value] = units.filter(u => u.unit_status === value).length;
      }
    });

    const availableUnits = statusCounts['Unsold'] || 0;
    const soldUnits = statusCounts['Sold'] || 0;
    const bookedUnits = statusCounts['Booked'] || 0;

    return {
      totalUnits,
      totalRevenue,
      totalValue,
      balanceAmount,
      availableUnits,
      soldUnits,
      bookedUnits,
      collectionRate: totalValue > 0 ? (totalRevenue / totalValue) * 100 : 0,
      ...statusCounts
    };
  }, [units]);

  const statusColors = {
    'Sold': { 
      bg: 'bg-gradient-to-r from-emerald-500 to-green-500', 
      text: 'text-emerald-800', 
      light: 'bg-gradient-to-br from-emerald-50 to-green-50',
      border: 'border-emerald-200',
      glow: 'shadow-emerald-100'
    },
    'Unsold': { 
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500', 
      text: 'text-amber-800', 
      light: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-amber-200',
      glow: 'shadow-amber-100'
    },
    'Booked': { 
      bg: 'bg-gradient-to-r from-blue-500 to-cyan-500', 
      text: 'text-blue-800', 
      light: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      glow: 'shadow-blue-100'
    },
    'Mortgage': { 
      bg: 'bg-gradient-to-r from-purple-500 to-indigo-500', 
      text: 'text-purple-800', 
      light: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      border: 'border-purple-200',
      glow: 'shadow-purple-100'
    },
    'Reservation': { 
      bg: 'bg-gradient-to-r from-indigo-500 to-purple-500', 
      text: 'text-indigo-800', 
      light: 'bg-gradient-to-br from-indigo-50 to-purple-50',
      border: 'border-indigo-200',
      glow: 'shadow-indigo-100'
    },
    'Rehab': { 
      bg: 'bg-gradient-to-r from-orange-500 to-red-500', 
      text: 'text-orange-800', 
      light: 'bg-gradient-to-br from-orange-50 to-red-50',
      border: 'border-orange-200',
      glow: 'shadow-orange-100'
    },
    'Land Owner/Investor Share (Not for Sale)': { 
      bg: 'bg-gradient-to-r from-gray-500 to-slate-500', 
      text: 'text-gray-800', 
      light: 'bg-gradient-to-br from-gray-50 to-slate-50',
      border: 'border-gray-200',
      glow: 'shadow-gray-100'
    },
    'Land Owner/Investor Share (for Sale)': { 
      bg: 'bg-gradient-to-r from-teal-500 to-cyan-500', 
      text: 'text-teal-800', 
      light: 'bg-gradient-to-br from-teal-50 to-cyan-50',
      border: 'border-teal-200',
      glow: 'shadow-teal-100'
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
    console.log(`Navigate to unit ${unitId}`)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-blue-50/50 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 break-words bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Units Overview
            </h1>
            <p className="text-gray-600 mt-2 text-base lg:text-lg">Manage and track all project units</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <div className="group bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Total</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl lg:text-4xl font-black text-gray-900">{formatNumber(stats.totalUnits)}</p>
            <p className="text-base text-gray-600 font-medium">Units</p>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-emerald-50/50 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              {stats.collectionRate.toFixed(1)}%
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl lg:text-3xl font-black text-gray-900 break-words">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-base text-gray-600 font-medium">Revenue</p>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-purple-50/50 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <IndianRupee className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Total Worth</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl lg:text-3xl font-black text-gray-900 break-words">{formatCurrency(stats.totalValue)}</p>
            <p className="text-base text-gray-600 font-medium">Value</p>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">Pending</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl lg:text-3xl font-black text-gray-900 break-words">{formatCurrency(stats.balanceAmount)}</p>
            <p className="text-base text-gray-600 font-medium">Balance</p>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-slate-600 to-gray-600 p-2 rounded-xl">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Status Distribution</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {Object.entries(stats).filter(([key]) => 
            ['soldUnits', 'availableUnits', 'bookedUnits'].includes(key)
          ).map(([key, value]) => {
            const statusName = key === 'soldUnits' ? 'Sold' : key === 'availableUnits' ? 'Unsold' : 'Booked';
            const colors = statusColors[statusName];
            const percentage = ((value / stats.totalUnits) * 100).toFixed(1);
            
            return (
              <div key={key} className="group text-center">
                <div className={`${colors.light} ${colors.border} border-2 rounded-2xl p-6 mb-3 group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1`}>
                  <div className={`w-4 h-4 ${colors.bg} rounded-full mx-auto mb-3 shadow-md`}></div>
                  <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
                  <p className="text-base font-semibold text-gray-600">{statusName}</p>
                </div>
                <p className="text-sm text-gray-500 font-medium">{percentage}% of total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search units, type, or customer..."
              className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-base font-medium placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="lg:w-64">
            <select
              className="w-full px-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-base font-medium"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Units List */}
        <div className="space-y-4">
          {filteredUnits.length > 0 ? (
            filteredUnits.map((unit) => {
              const colors = statusColors[unit.unit_status] || statusColors['Unsold'];
              
              return (
                <div
                  key={unit.id}
                  className="group bg-gradient-to-r from-white to-slate-50/30 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:border-blue-300 hover:-translate-y-1 min-w-0"
                  onClick={() => handleUnitClick(unit.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="bg-gradient-to-r from-gray-100 to-slate-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Home className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 break-words text-lg">{unit.unit_name}</h4>
                        <p className="text-gray-600 break-words font-medium">{unit.unit_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${colors.text} ${colors.light} ${colors.border} border-2 shadow-sm`}>
                        {unit.unit_status}
                      </span>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="min-w-0 bg-gray-50/50 rounded-xl p-3">
                      <p className="text-gray-500 font-medium text-sm">Area</p>
                      <p className="font-bold text-gray-900 break-words text-lg">{unit.carpet_area} sq ft</p>
                    </div>
                    <div className="min-w-0 bg-gray-50/50 rounded-xl p-3">
                      <p className="text-gray-500 font-medium text-sm">Value</p>
                      <p className="font-bold text-gray-900 break-words text-lg">{formatCurrency(unit.agreement_value)}</p>
                    </div>
                    <div className="min-w-0 bg-emerald-50/50 rounded-xl p-3">
                      <p className="text-gray-500 font-medium text-sm">Received</p>
                      <p className="font-bold text-emerald-700 break-words text-lg">{formatCurrency(unit.total_received)}</p>
                    </div>
                    <div className="min-w-0 bg-amber-50/50 rounded-xl p-3">
                      <p className="text-gray-500 font-medium text-sm">Balance</p>
                      <p className="font-bold text-amber-700 break-words text-lg">{formatCurrency(unit.balance_amount)}</p>
                    </div>
                  </div>
                  
                  {unit.customer_name && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-100">
                      <p className="text-gray-600 font-medium break-words">
                        <span className="font-bold text-gray-900">Customer:</span> {unit.customer_name}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <div className="bg-gradient-to-r from-gray-100 to-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No units found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Units