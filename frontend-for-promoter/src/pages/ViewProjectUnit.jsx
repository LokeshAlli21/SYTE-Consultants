import React, { useEffect, useState } from 'react'
import { ArrowLeft, Download, Eye, FileText, Calendar, DollarSign, Home, User, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react'
import databaseService from '../backend-services/database/database'
import { useParams } from 'react-router-dom'


function ViewProjectUnit() {
  const {id} = useParams()
  const navigate = () => window.history.back() // Mock navigate function

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
      case 'sold': return 'bg-green-100 text-green-800 border-green-200'
      case 'unsold': return 'bg-red-100 text-red-800 border-red-200'
      case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
      color: 'bg-blue-500',
      date: unit.agreement_for_sale_date
    },
    {
      name: 'Sale Deed',
      url: unit.sale_deed_uploaded_url,
      icon: FileText,
      color: 'bg-green-500',
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
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">{unit.unit_name}</h1>
              <p className="text-sm text-gray-500">{unit.unit_type}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(unit.unit_status)}`}>
              {getStatusIcon(unit.unit_status)}
              <span>{unit.unit_status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section - Prominent placement */}
      <div className="">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              Documents
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {documents.map((doc, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg ${doc.color} flex items-center justify-center`}>
                      <doc.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{doc.name}</h3>
                      <p className="text-sm text-gray-500">
                        {doc.date ? formatDate(doc.date) : 'Date not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.url ? (
                      <>
                        <button
                          onClick={() => handleDocumentPreview(doc.url, doc.name)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDocumentDownload(doc.url, doc.name)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="px-3 py-1 bg-gray-200 text-gray-500 rounded-lg text-sm">
                        Not Available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className=" mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'financial', label: 'Financial', icon: DollarSign },
              { id: 'payments', label: 'Payments', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4 mx-auto mb-1" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className=" pb-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-blue-500" />
                  Unit Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Unit Name</p>
                    <p className="font-medium text-gray-900">{unit.unit_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unit Type</p>
                    <p className="font-medium text-gray-900">{unit.unit_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Carpet Area</p>
                    <p className="font-medium text-gray-900">{unit.carpet_area} sq ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.unit_status)}`}>
                      {getStatusIcon(unit.unit_status)}
                      <span className="ml-1">{unit.unit_status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-500" />
                  Customer Information
                </h3>
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium text-gray-900">{unit.customer_name || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                  Financial Summary
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-700">Agreement Value</p>
                    <p className="text-xl font-bold text-blue-900">{formatCurrency(unit.agreement_value)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-700">Total Received</p>
                      <p className="text-lg font-bold text-green-900">{formatCurrency(unit.total_received)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <p className="text-sm text-red-700">Balance Amount</p>
                      <p className="text-lg font-bold text-red-900">{formatCurrency(unit.balance_amount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                  Important Dates
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Agreement Date</span>
                    <span className="font-medium">{formatDate(unit.agreement_for_sale_date)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Sale Deed Date</span>
                    <span className="font-medium">{formatDate(unit.sale_deed_date)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                  Payment History
                </h3>
                {paymentYears.length > 0 ? (
                  <div className="space-y-3">
                    {paymentYears.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">FY {payment.year}</span>
                        <span className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No payment history available</p>
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