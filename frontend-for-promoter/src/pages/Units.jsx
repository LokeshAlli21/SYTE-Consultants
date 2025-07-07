import React, { useEffect, useState,useMemo } from 'react'
import { useParams } from 'react-router-dom'
import databaseService from '../backend-services/database/database'
import {
  Building2, CheckCircle, Clock, BookOpen, DollarSign, TrendingUp, AlertCircle,
  Lock, CalendarCheck, Hammer, Ban, Tag,IndianRupee
} from 'lucide-react';

function Units() {

  const {projectId} = useParams()

  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Simulate API call with mock data
    const fetchProjectUnits = async () => {
      try {
        setLoading(true)
        const result = await databaseService.getProjectUnits(projectId)
        console.log('fetched units: ', result) /* fetched units: [
                                                    {
                                                        "id": 2,
                                                        "project_id": 10,
                                                        "unit_name": "Shop 01",
                                                        "unit_type": "Shops",
                                                        "carpet_area": "50.50",
                                                        "unit_status": "Unsold",
                                                        "customer_name": "sohel Shaikh",
                                                        "agreement_value": "5000.00",
                                                        "total_received": "1500.00",
                                                        "balance_amount": "3500.00",
                                                        "created_at": "2025-06-28T13:09:03.758Z",
                                                        "updated_at": "2025-06-28T13:09:03.758Z"
                                                    }
                                                ] */
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
    icon: IndianRupee,
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
    <div>

      <div className="flex max-w-6xl gap-4 overflow-x-scroll py-4 mb-2 mx-auto" style={{
    scrollbarWidth: 'none',        // Firefox
    msOverflowStyle: 'none'        // IE 10+
  }}>
      {cardData.map((card, index) => (
        <div
          key={index}
          className={`
            min-w-[200px] w-fit max-w-[400px] flex-shrink-0
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

    </div>
  )
}

export default Units