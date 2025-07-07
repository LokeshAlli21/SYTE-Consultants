import React, { useEffect, useState, useMemo } from 'react'
import {
  Building2, CheckCircle, Clock, BookOpen, DollarSign, TrendingUp, AlertCircle,
  Lock, CalendarCheck, Hammer, Ban, Tag, IndianRupee, Search, Filter, 
  ArrowUpRight, Eye, MoreVertical, ChevronRight, Home, MapPin
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
    { value: "All", label: "All Status" },
    { value: "Sold", label: "Sold" },
    { value: "Unsold", label: "Unsold" },
    { value: "Booked", label: "Booked" },
    { value: "Mortgage", label: "Mortgage" },
    { value: "Reservation", label: "Reservation" },
    { value: "Rehab", label: "Rehab" },
    { value: "Land Owner/Investor Share (Not for Sale)", label: "Land Owner/Investor Share (Not for Sale)" },
    { value: "Land Owner/Investor Share (for Sale)", label: "Land Owner/Investor Share (for Sale)" },
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
    'Sold': { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50' },
    'Unsold': { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50' },
    'Booked': { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50' },
    'Mortgage': { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50' },
    'Reservation': { bg: 'bg-indigo-500', text: 'text-indigo-700', light: 'bg-indigo-50' },
    'Rehab': { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50' },
    'Land Owner/Investor Share (Not for Sale)': { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-50' },
    'Land Owner/Investor Share (for Sale)': { bg: 'bg-teal-500', text: 'text-teal-700', light: 'bg-teal-50' }
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
    // In your actual app: navigate(`/unit/${unitId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen p-8">
      <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-md border border-white/30 p-8 max-w-4xl mx-auto hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/20 pointer-events-none"></div>
        
        <div className="relative flex items-center justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent break-words drop-shadow-sm">
              Units Overview
            </h1>
            <p className="text-slate-600 mt-2 text-lg font-medium">Manage and track all project units</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Building2 className="w-8 h-8 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-50 p-2 rounded-xl flex-shrink-0">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500 break-words">Total</span>
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-2xl font-bold text-gray-900 break-words">{formatNumber(stats.totalUnits)}</p>
            <p className="text-sm text-gray-600">Units</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-50 p-2 rounded-xl flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 break-words">
              {stats.collectionRate.toFixed(1)}%
            </span>
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-2xl font-bold text-gray-900 break-words">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-gray-600">Revenue</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-50 p-2 rounded-xl flex-shrink-0">
              <IndianRupee className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500 break-words">Total Worth</span>
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-2xl font-bold text-gray-900 break-words">{formatCurrency(stats.totalValue)}</p>
            <p className="text-sm text-gray-600">Value</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-amber-50 p-2 rounded-xl flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-amber-600 break-words">Pending</span>
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-2xl font-bold text-gray-900 break-words">{formatCurrency(stats.balanceAmount)}</p>
            <p className="text-sm text-gray-600">Balance</p>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(stats).filter(([key]) => 
            ['soldUnits', 'availableUnits', 'bookedUnits'].includes(key)
          ).map(([key, value]) => {
            const statusName = key === 'soldUnits' ? 'Sold' : key === 'availableUnits' ? 'Unsold' : 'Booked';
            const colors = statusColors[statusName];
            const percentage = ((value / stats.totalUnits) * 100).toFixed(1);
            
            return (
              <div key={key} className="text-center min-w-0">
                <div className={`${colors.light} rounded-xl p-4 mb-2`}>
                  <div className={`w-3 h-3 ${colors.bg} rounded-full mx-auto mb-2`}></div>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-600">{statusName}</p>
                </div>
                <p className="text-xs text-gray-500 break-words">{percentage}% of total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search units, type, or customer..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full">
            <select
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-200 min-w-0"
                  onClick={() => handleUnitClick(unit.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="bg-gray-50 p-2 rounded-lg flex-shrink-0">
                        <Home className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 break-words">{unit.unit_name}</h4>
                        <p className="text-sm text-gray-600 break-words">{unit.unit_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.text} ${colors.light} break-words`}>
                        {unit.unit_status}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="min-w-0">
                      <p className="text-gray-500">Area</p>
                      <p className="font-medium text-gray-900 break-words">{unit.carpet_area} sq ft</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500">Value</p>
                      <p className="font-medium text-gray-900 break-words">{formatCurrency(unit.agreement_value)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500">Received</p>
                      <p className="font-medium text-green-600 break-words">{formatCurrency(unit.total_received)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500">Balance</p>
                      <p className="font-medium text-amber-600 break-words">{formatCurrency(unit.balance_amount)}</p>
                    </div>
                  </div>
                  
                  {unit.customer_name && (
                    <div className="mt-3 pt-3 border-t border-gray-100 min-w-0">
                      <p className="text-sm text-gray-600 break-words">
                        <span className="font-medium">Customer:</span> {unit.customer_name}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No units found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Units