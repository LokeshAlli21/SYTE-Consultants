import React, { useEffect, useState, useMemo } from 'react'
import {
  Building2, CheckCircle, Clock, BookOpen, DollarSign, TrendingUp, AlertCircle,
  Lock, CalendarCheck, Hammer, Ban, Tag, IndianRupee, Search, Filter, 
  ArrowUpRight, Eye, MoreVertical, ChevronRight, Home, MapPin, X, Menu
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import databaseService from '../backend-services/database/database';

function Units() {
  const [units, setUnits] = useState([])
  
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)

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
    { value: "All", label: "All Status", icon: "🏠" },
    { value: "Sold", label: "Sold", icon: "✅" },
    { value: "Unsold", label: "Unsold", icon: "🟡" },
    { value: "Booked", label: "Booked", icon: "📝" },
    { value: "Mortgage", label: "Mortgage", icon: "🏦" },
    { value: "Reservation", label: "Reservation", icon: "⏳" },
    { value: "Rehab", label: "Rehab", icon: "🔨" },
    { value: "Land Owner/Investor Share (Not for Sale)", label: "Land Owner/Investor Share (Not for Sale)", icon: "🔒" },
    { value: "Land Owner/Investor Share (for Sale)", label: "Land Owner/Investor Share (for Sale)", icon: "🏷️" },
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
      bg: 'bg-gradient-to-br from-emerald-500 to-green-600', 
      text: 'text-emerald-700', 
      light: 'bg-gradient-to-br from-emerald-50 to-green-50',
      ring: 'ring-emerald-500/20',
      dot: 'bg-emerald-400'
    },
    'Unsold': { 
      bg: 'bg-gradient-to-br from-amber-500 to-orange-600', 
      text: 'text-amber-700', 
      light: 'bg-gradient-to-br from-amber-50 to-orange-50',
      ring: 'ring-amber-500/20',
      dot: 'bg-amber-400'
    },
    'Booked': { 
      bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', 
      text: 'text-blue-700', 
      light: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      ring: 'ring-blue-500/20',
      dot: 'bg-blue-400'
    },
    'Mortgage': { 
      bg: 'bg-gradient-to-br from-purple-500 to-violet-600', 
      text: 'text-purple-700', 
      light: 'bg-gradient-to-br from-purple-50 to-violet-50',
      ring: 'ring-purple-500/20',
      dot: 'bg-purple-400'
    },
    'Reservation': { 
      bg: 'bg-gradient-to-br from-cyan-500 to-teal-600', 
      text: 'text-cyan-700', 
      light: 'bg-gradient-to-br from-cyan-50 to-teal-50',
      ring: 'ring-cyan-500/20',
      dot: 'bg-cyan-400'
    },
    'Rehab': { 
      bg: 'bg-gradient-to-br from-orange-500 to-red-600', 
      text: 'text-orange-700', 
      light: 'bg-gradient-to-br from-orange-50 to-red-50',
      ring: 'ring-orange-500/20',
      dot: 'bg-orange-400'
    },
    'Land Owner/Investor Share (Not for Sale)': { 
      bg: 'bg-gradient-to-br from-gray-500 to-slate-600', 
      text: 'text-gray-700', 
      light: 'bg-gradient-to-br from-gray-50 to-slate-50',
      ring: 'ring-gray-500/20',
      dot: 'bg-gray-400'
    },
    'Land Owner/Investor Share (for Sale)': { 
      bg: 'bg-gradient-to-br from-teal-500 to-emerald-600', 
      text: 'text-teal-700', 
      light: 'bg-gradient-to-br from-teal-50 to-emerald-50',
      ring: 'ring-teal-500/20',
      dot: 'bg-teal-400'
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
    const unit = units.find(u => u.id === unitId);
    setSelectedUnit(unit);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{stats.totalUnits}</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Units</h1>
                  <p className="text-sm text-gray-600">Project Overview</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUnits)}</div>
                  <div className="text-sm text-gray-600">Total Units</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-blue-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue/1000000).replace('₹', '₹')}M</div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-green-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{width: `${stats.collectionRate}%`}}></div>
                </div>
                <span className="text-xs font-medium text-green-600">{stats.collectionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue/1000000).replace('₹', '₹')}M</div>
                <div className="text-sm text-gray-600">Total Portfolio Value</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-gray-600">Pending: {formatCurrency(stats.balanceAmount/1000000).replace('₹', '₹')}M</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Status Overview */}
        <div className="px-4 pb-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Sold', value: stats.soldUnits, color: 'emerald' },
                { label: 'Available', value: stats.availableUnits, color: 'amber' },
                { label: 'Booked', value: stats.bookedUnits, color: 'blue' }
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${color}-100 to-${color}-200 rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <div className={`w-6 h-6 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-full`}></div>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{value}</div>
                  <div className="text-sm text-gray-600">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-4 pb-6">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search units, type, or customer..."
              className="w-full pl-14 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {showFilters && (
            <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3">Filter by Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.slice(0, 6).map(option => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      statusFilter === option.value
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Units List */}
        <div className="px-4 pb-8">
          <div className="space-y-4">
            {filteredUnits.length > 0 ? (
              filteredUnits.map((unit) => {
                const colors = statusColors[unit.unit_status] || statusColors['Unsold'];
                
                return (
                  <div
                    key={unit.id}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 active:scale-95"
                    onClick={() => handleUnitClick(unit.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                          <Home className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{unit.unit_name}</h4>
                          <p className="text-sm text-gray-600">{unit.unit_type} • {unit.carpet_area} sq ft</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 ${colors.light} ${colors.ring} ring-1 rounded-full`}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 ${colors.dot} rounded-full`}></div>
                            <span className={`text-xs font-medium ${colors.text}`}>
                              {unit.unit_status === 'Land Owner/Investor Share (Not for Sale)' ? 'Land Share' : unit.unit_status}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-2xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Total Value</p>
                        <p className="font-bold text-gray-900">{formatCurrency(unit.agreement_value/1000000).replace('₹', '₹')}M</p>
                      </div>
                      <div className="bg-green-50 rounded-2xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Received</p>
                        <p className="font-bold text-green-600">{formatCurrency(unit.total_received/1000000).replace('₹', '₹')}M</p>
                      </div>
                    </div>
                    
                    {unit.balance_amount > 0 && (
                      <div className="bg-amber-50 rounded-2xl p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-amber-600 mb-1">Balance Due</p>
                            <p className="font-bold text-amber-700">{formatCurrency(unit.balance_amount/1000000).replace('₹', '₹')}M</p>
                          </div>
                          <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {unit.customer_name && (
                      <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">{unit.customer_name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">{unit.customer_name}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No units found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Unit Detail Modal */}
        {selectedUnit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Unit Details</h2>
                  <button
                    onClick={() => setSelectedUnit(null)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedUnit.unit_name}</h3>
                      <p className="text-gray-600">{selectedUnit.unit_type} • {selectedUnit.carpet_area} sq ft</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`px-4 py-2 ${statusColors[selectedUnit.unit_status]?.light} rounded-full`}>
                      <span className={`text-sm font-medium ${statusColors[selectedUnit.unit_status]?.text}`}>
                        {selectedUnit.unit_status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-sm text-gray-500 mb-2">Agreement Value</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedUnit.agreement_value)}</p>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-4">
                    <p className="text-sm text-gray-500 mb-2">Amount Received</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(selectedUnit.total_received)}</p>
                  </div>
                </div>

                {selectedUnit.balance_amount > 0 && (
                  <div className="bg-amber-50 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-gray-500 mb-2">Balance Amount</p>
                    <p className="text-xl font-bold text-amber-600">{formatCurrency(selectedUnit.balance_amount)}</p>
                  </div>
                )}

                {selectedUnit.customer_name && (
                  <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-gray-500 mb-2">Customer</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{selectedUnit.customer_name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{selectedUnit.customer_name}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-blue-500 text-white py-4 rounded-2xl font-semibold hover:bg-blue-600 transition-colors">
                    Edit Unit
                  </button>
                  <button className="bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition-colors">
                    View History
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Units