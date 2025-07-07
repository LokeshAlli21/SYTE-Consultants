import React, { useEffect, useState } from 'react'
import { ArrowLeft, Download, Eye, FileText, Calendar, DollarSign, Home, User, MapPin, CheckCircle, XCircle, Clock, TrendingUp, CreditCard, Building } from 'lucide-react'
import databaseService from '../backend-services/database/database'
import { useParams } from 'react-router-dom'

function ViewProjectUnit() {
  const {id} = useParams()
  const navigate = () => window.history.back()

  const [unit, setUnit] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        setLoading(true)
        const result = await databaseService.getProjectUnitById(id)
        if (result) {
          setUnit(result)
        } else {
          setError("Unit not found")
        }
      } catch (error) {
        console.error("Error fetching Unit:", error)
        setError("Failed to load Unit")
      } finally {
        setLoading(false)
      }
    }

    fetchUnit()
  }, [id])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'sold': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      case 'unsold': return 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
      case 'reserved': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'sold': return <CheckCircle className="w-4 h-4" />
      case 'unsold': return <XCircle className="w-4 h-4" />
      case 'reserved': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const paymentYears = [
    { year: '2018-19', amount: unit.received_fy_2018_19 },
    { year: '2019-20', amount: unit.received_fy_2019_20 },
    { year: '2020-21', amount: unit.received_fy_2020_21 },
    { year: '2021-22', amount: unit.received_fy_2021_22 },
    { year: '2022-23', amount: unit.received_fy_2022_23 },
    { year: '2023-24', amount: unit.received_fy_2023_24 },
    { year: '2024-25', amount: unit.received_fy_2024_25 },
    { year: '2025-26', amount: unit.received_fy_2025_26 },
    { year: '2026-27', amount: unit.received_fy_2026_27 },
    { year: '2027-28', amount: unit.received_fy_2027_28 },
    { year: '2028-29', amount: unit.received_fy_2028_29 },
    { year: '2029-30', amount: unit.received_fy_2029_30 },
  ].filter(item => parseFloat(item.amount) > 0)

  const documents = [
    {
      name: 'Agreement for Sale',
      url: unit.afs_uploaded_url,
      icon: FileText,
      color: 'from-blue-500 to-indigo-500',
      date: unit.agreement_for_sale_date
    },
    {
      name: 'Sale Deed',
      url: unit.sale_deed_uploaded_url,
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      date: unit.sale_deed_date
    }
  ]

  const handleDocumentPreview = (url, name) => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  const handleDocumentDownload = (url, name) => {
    if (url) {
      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.click()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-6">
          <div className="p-6">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse mb-3"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-1/2"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse mb-3"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-sm mx-4">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Oops!</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl py-3 px-6 font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Hero Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{unit.unit_name}</h1>
              <div className="flex items-center space-x-2 text-blue-100">
                <Building className="w-4 h-4" />
                <span className="text-sm font-medium">{unit.unit_type}</span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 ${getStatusColor(unit.unit_status)} shadow-lg`}>
              {getStatusIcon(unit.unit_status)}
              <span>{unit.unit_status}</span>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{unit.carpet_area}</p>
              <p className="text-sm text-gray-600">Sq Ft</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(unit.agreement_value)}</p>
              <p className="text-sm text-gray-600">Agreement Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Documents
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {documents.map((doc, index) => (
            <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${doc.color} flex items-center justify-center shadow-lg`}>
                    <doc.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {doc.date ? formatDate(doc.date) : 'Date not specified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.url ? (
                    <>
                      <button
                        onClick={() => handleDocumentPreview(doc.url, doc.name)}
                        className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDocumentDownload(doc.url, doc.name)}
                        className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 rounded-xl text-sm font-medium">
                      Not Available
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: Home, color: 'from-blue-500 to-indigo-500' },
            { id: 'financial', label: 'Financial', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
            { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-purple-500 to-pink-500' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-4 text-center font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5 mx-auto mb-2" />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="pb-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  Unit Details
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Unit Name</p>
                    <p className="text-lg font-bold text-gray-900">{unit.unit_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                      <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                      <p className="font-semibold text-gray-900">{unit.unit_type}</p>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                      <p className="text-sm font-medium text-gray-500 mb-1">Carpet Area</p>
                      <p className="font-semibold text-gray-900">{unit.carpet_area} sq ft</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Customer Information
                </h3>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-1">Customer Name</p>
                  <p className="text-lg font-bold text-gray-900">{unit.customer_name || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Financial Summary
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
                  <p className="text-blue-100 text-sm font-medium mb-2">Agreement Value</p>
                  <p className="text-3xl font-bold">{formatCurrency(unit.agreement_value)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-green-100 text-sm font-medium mb-2">Total Received</p>
                    <p className="text-xl font-bold">{formatCurrency(unit.total_received)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-red-100 text-sm font-medium mb-2">Balance Amount</p>
                    <p className="text-xl font-bold">{formatCurrency(unit.balance_amount)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  Important Dates
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Agreement Date</span>
                    <span className="font-bold text-gray-900">{formatDate(unit.agreement_for_sale_date)}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Sale Deed Date</span>
                    <span className="font-bold text-gray-900">{formatDate(unit.sale_deed_date)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  Payment History
                </h3>
              </div>
              <div className="p-6">
                {paymentYears.length > 0 ? (
                  <div className="space-y-3">
                    {paymentYears.map((payment, index) => (
                      <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{payment.year.split('-')[0].slice(-2)}</span>
                            </div>
                            <span className="font-semibold text-gray-900">FY {payment.year}</span>
                          </div>
                          <span className="text-xl font-bold text-green-600">{formatCurrency(payment.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No payment history available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewProjectUnit