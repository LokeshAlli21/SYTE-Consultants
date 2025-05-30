import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp, Users, Building2, FileText, AlertTriangle, DollarSign, Activity, Clock, MapPin, Home, UserCheck,IndianRupee , Layers } from 'lucide-react';
import databaseService from '../backend-services/database/database';

// Updated database service to match SQL views structure
// const databaseService = {
//   async getGeneralStats() {
//     // Based on dashboard_general_stats view
//     return {
//       total_promoters: 1245,
//       promoters_this_month: 78,
//       total_channel_partners: 567,
//       channel_partners_this_month: 34,
//       total_projects: 892,
//       projects_this_month: 45,
//       residential_projects: 634,
//       commercial_projects: 258,
//       total_assignments: 2134,
//       assignments_this_month: 156,
//       total_engineers: 89,
//       total_architects: 67,
//       total_cas: 123,
//       total_consultation_value: 12450000,
//       consultation_value_this_month: 890000,
//       promoter_districts_covered: 28,
//       promoter_cities_covered: 145,
//       project_districts_covered: 24,
//       project_cities_covered: 98
//     };
//   },

//   async getMonthlyPromoters() {
//     // Based on dashboard_monthly_promoters view
//     return [
//       { month_year: '2024-01', year: 2024, month: 1, month_name: 'Jan 2024', promoters_added: 45, individual_promoters: 28, company_promoters: 12, partnership_promoters: 3, other_promoters: 2 },
//       { month_year: '2024-02', year: 2024, month: 2, month_name: 'Feb 2024', promoters_added: 52, individual_promoters: 31, company_promoters: 15, partnership_promoters: 4, other_promoters: 2 },
//       { month_year: '2024-03', year: 2024, month: 3, month_name: 'Mar 2024', promoters_added: 38, individual_promoters: 22, company_promoters: 11, partnership_promoters: 3, other_promoters: 2 },
//       { month_year: '2024-04', year: 2024, month: 4, month_name: 'Apr 2024', promoters_added: 67, individual_promoters: 40, company_promoters: 18, partnership_promoters: 6, other_promoters: 3 },
//       { month_year: '2024-05', year: 2024, month: 5, month_name: 'May 2024', promoters_added: 73, individual_promoters: 45, company_promoters: 20, partnership_promoters: 5, other_promoters: 3 },
//       { month_year: '2024-06', year: 2024, month: 6, month_name: 'Jun 2024', promoters_added: 58, individual_promoters: 35, company_promoters: 16, partnership_promoters: 4, other_promoters: 3 }
//     ];
//   },

//   async getMonthlyChannelPartners() {
//     // Based on dashboard_monthly_channel_partners view
//     return [
//       { month_year: '2024-01', year: 2024, month: 1, month_name: 'Jan 2024', channel_partners_added: 23, districts_covered: 8, cities_covered: 15 },
//       { month_year: '2024-02', year: 2024, month: 2, month_name: 'Feb 2024', channel_partners_added: 31, districts_covered: 10, cities_covered: 18 },
//       { month_year: '2024-03', year: 2024, month: 3, month_name: 'Mar 2024', channel_partners_added: 19, districts_covered: 6, cities_covered: 12 },
//       { month_year: '2024-04', year: 2024, month: 4, month_name: 'Apr 2024', channel_partners_added: 42, districts_covered: 12, cities_covered: 22 },
//       { month_year: '2024-05', year: 2024, month: 5, month_name: 'May 2024', channel_partners_added: 38, districts_covered: 11, cities_covered: 19 },
//       { month_year: '2024-06', year: 2024, month: 6, month_name: 'Jun 2024', channel_partners_added: 29, districts_covered: 9, cities_covered: 16 }
//     ];
//   },

//   async getMonthlyProjects() {
//     // Based on dashboard_monthly_projects view
//     return [
//       { month_year: '2024-01', year: 2024, month: 1, month_name: 'Jan 2024', projects_added: 34, residential_projects: 24, commercial_projects: 8, other_projects: 2, districts_covered: 6, cities_covered: 12 },
//       { month_year: '2024-02', year: 2024, month: 2, month_name: 'Feb 2024', projects_added: 28, residential_projects: 20, commercial_projects: 6, other_projects: 2, districts_covered: 5, cities_covered: 10 },
//       { month_year: '2024-03', year: 2024, month: 3, month_name: 'Mar 2024', projects_added: 45, residential_projects: 32, commercial_projects: 10, other_projects: 3, districts_covered: 8, cities_covered: 15 },
//       { month_year: '2024-04', year: 2024, month: 4, month_name: 'Apr 2024', projects_added: 52, residential_projects: 37, commercial_projects: 12, other_projects: 3, districts_covered: 9, cities_covered: 18 },
//       { month_year: '2024-05', year: 2024, month: 5, month_name: 'May 2024', projects_added: 39, residential_projects: 28, commercial_projects: 9, other_projects: 2, districts_covered: 7, cities_covered: 14 },
//       { month_year: '2024-06', year: 2024, month: 6, month_name: 'Jun 2024', projects_added: 47, residential_projects: 34, commercial_projects: 11, other_projects: 2, districts_covered: 8, cities_covered: 16 }
//     ];
//   },

//   async getMonthlyAssignments() {
//     // Based on dashboard_monthly_assignments view
//     return [
//       { month_year: '2024-01', year: 2024, month: 1, month_name: 'Jan 2024', assignments_added: 156, assignment_types: 8, avg_consultation_charges: 45000.00, total_consultation_charges: 7020000, total_operational_costs: 3510000 },
//       { month_year: '2024-02', year: 2024, month: 2, month_name: 'Feb 2024', assignments_added: 142, assignment_types: 7, avg_consultation_charges: 47000.00, total_consultation_charges: 6674000, total_operational_costs: 3337000 },
//       { month_year: '2024-03', year: 2024, month: 3, month_name: 'Mar 2024', assignments_added: 189, assignment_types: 9, avg_consultation_charges: 46000.00, total_consultation_charges: 8694000, total_operational_costs: 4347000 },
//       { month_year: '2024-04', year: 2024, month: 4, month_name: 'Apr 2024', assignments_added: 203, assignment_types: 10, avg_consultation_charges: 48000.00, total_consultation_charges: 9744000, total_operational_costs: 4872000 },
//       { month_year: '2024-05', year: 2024, month: 5, month_name: 'May 2024', assignments_added: 178, assignment_types: 8, avg_consultation_charges: 46500.00, total_consultation_charges: 8277000, total_operational_costs: 4138500 },
//       { month_year: '2024-06', year: 2024, month: 6, month_name: 'Jun 2024', assignments_added: 195, assignment_types: 9, avg_consultation_charges: 47500.00, total_consultation_charges: 9262500, total_operational_costs: 4631250 }
//     ];
//   },

//   async getAssignmentStatusSummary() {
//     // Based on dashboard_assignment_status_summary view
//     return [
//       { current_status: 'In Progress', assignment_count: 756, percentage: 35.42, projects_involved: 234, assignment_types_involved: 8, total_consultation_value: 34020000, avg_consultation_value: 45000 },
//       { current_status: 'Completed', assignment_count: 678, percentage: 31.77, projects_involved: 201, assignment_types_involved: 9, total_consultation_value: 30510000, avg_consultation_value: 45000 },
//       { current_status: 'Pending Approval', assignment_count: 345, percentage: 16.17, projects_involved: 112, assignment_types_involved: 7, total_consultation_value: 15525000, avg_consultation_value: 45000 },
//       { current_status: 'On Hold', assignment_count: 234, percentage: 10.97, projects_involved: 89, assignment_types_involved: 6, total_consultation_value: 10530000, avg_consultation_value: 45000 },
//       { current_status: 'Not Started', assignment_count: 121, percentage: 5.67, projects_involved: 45, assignment_types_involved: 5, total_consultation_value: 5445000, avg_consultation_value: 45000 }
//     ];
//   },

//   async getDailyReminders() {
//     // Based on dashboard_daily_reminders view
//     return [
//       { 
//         reminder_id: 1, 
//         assignment_id: 101,
//         assignment_type: 'RERA Registration',
//         project_name: 'Skyline Towers Phase 1',
//         promoter_name: 'ABC Developers Ltd',
//         message: 'RERA renewal documentation to be submitted',
//         date_and_time: '2024-06-15T10:00:00Z',
//         assignment_status: 'In Progress',
//         reminder_status: 'Active',
//         urgency: 'Due Today',
//         days_difference: 0
//       },
//       { 
//         reminder_id: 2, 
//         assignment_id: 102,
//         assignment_type: 'Site Inspection',
//         project_name: 'Green Valley Apartments',
//         promoter_name: 'XYZ Constructions',
//         message: 'Site inspection scheduled with engineer',
//         date_and_time: '2024-06-16T14:30:00Z',
//         assignment_status: 'Pending',
//         reminder_status: 'Active',
//         urgency: 'Upcoming',
//         days_difference: 1
//       },
//       { 
//         reminder_id: 3, 
//         assignment_id: 103,
//         assignment_type: 'Documentation Review',
//         project_name: 'Metro Heights',
//         promoter_name: 'PQR Builders',
//         message: 'Final documentation review pending',
//         date_and_time: '2024-06-14T09:00:00Z',
//         assignment_status: 'In Progress',
//         reminder_status: 'Active',
//         urgency: 'Overdue',
//         days_difference: -1
//       }
//     ];
//   },

//   async getMonthlyFinancialSummary() {
//     // Based on dashboard_monthly_financial_summary view
//     return [
//       { month_year: '2024-01', month_name: 'Jan 2024', assignments_count: 156, total_consultation_revenue: 7020000, total_govt_fees: 1560000, total_ca_fees: 780000, total_engineer_fees: 624000, total_architect_fees: 468000, total_liasioning_fees: 78000, total_operational_costs: 3510000, net_revenue: 3510000, avg_consultation_charges: 45000 },
//       { month_year: '2024-02', month_name: 'Feb 2024', assignments_count: 142, total_consultation_revenue: 6674000, total_govt_fees: 1420000, total_ca_fees: 710000, total_engineer_fees: 568000, total_architect_fees: 426000, total_liasioning_fees: 71000, total_operational_costs: 3195000, net_revenue: 3479000, avg_consultation_charges: 47000 },
//       { month_year: '2024-03', month_name: 'Mar 2024', assignments_count: 189, total_consultation_revenue: 8694000, total_govt_fees: 1890000, total_ca_fees: 945000, total_engineer_fees: 756000, total_architect_fees: 567000, total_liasioning_fees: 94500, total_operational_costs: 4252500, net_revenue: 4441500, avg_consultation_charges: 46000 },
//       { month_year: '2024-04', month_name: 'Apr 2024', assignments_count: 203, total_consultation_revenue: 9744000, total_govt_fees: 2030000, total_ca_fees: 1015000, total_engineer_fees: 812000, total_architect_fees: 609000, total_liasioning_fees: 101500, total_operational_costs: 4567500, net_revenue: 5176500, avg_consultation_charges: 48000 },
//       { month_year: '2024-05', month_name: 'May 2024', assignments_count: 178, total_consultation_revenue: 8277000, total_govt_fees: 1780000, total_ca_fees: 890000, total_engineer_fees: 712000, total_architect_fees: 534000, total_liasioning_fees: 89000, total_operational_costs: 4005000, net_revenue: 4272000, avg_consultation_charges: 46500 },
//       { month_year: '2024-06', month_name: 'Jun 2024', assignments_count: 195, total_consultation_revenue: 9262500, total_govt_fees: 1950000, total_ca_fees: 975000, total_engineer_fees: 780000, total_architect_fees: 585000, total_liasioning_fees: 97500, total_operational_costs: 4387500, net_revenue: 4875000, avg_consultation_charges: 47500 }
//     ];
//   },

//   async getRecentActivity() {
//     // Based on dashboard_recent_activity view
//     return [
//       { 
//         activity_date: '2024-06-14T15:30:00Z',
//         activity_type: 'New Project Added',
//         entity_name: 'Skyline Towers Phase 2',
//         entity_type: 'Project',
//         created_by_user: 'john_doe',
//         district: 'Mumbai Suburban',
//         city: 'Thane'
//       },
//       { 
//         activity_date: '2024-06-14T14:20:00Z',
//         activity_type: 'New Assignment Created',
//         entity_name: 'RERA Registration',
//         entity_type: 'Assignment',
//         created_by_user: 'jane_smith',
//         district: null,
//         city: null
//       },
//       { 
//         activity_date: '2024-06-14T11:45:00Z',
//         activity_type: 'New Promoter Added',
//         entity_name: 'DEF Developers Pvt Ltd',
//         entity_type: 'Promoter',
//         created_by_user: 'mike_johnson',
//         district: 'Pune',
//         city: 'Pune'
//       },
//       { 
//         activity_date: '2024-06-14T10:15:00Z',
//         activity_type: 'New Channel Partner Added',
//         entity_name: 'Real Estate Consultants Inc',
//         entity_type: 'Channel Partner',
//         created_by_user: 'sarah_wilson',
//         district: 'Mumbai',
//         city: 'Mumbai'
//       }
//     ];
//   },

//   async getReraExpiryAlerts() {
//     // Based on dashboard_rera_expiry_alerts view
//     return [
//       { project_id: 101, project_name: 'Green Valley Phase 1', rera_number: 'P52100012345', expiry_date: '2024-06-20', promoter_name: 'ABC Developers', district: 'Pune', city: 'Pune', days_to_expiry: 6, alert_level: 'Critical' },
//       { project_id: 102, project_name: 'Metro Heights Tower A', rera_number: 'P52100012346', expiry_date: '2024-07-15', promoter_name: 'XYZ Constructions', district: 'Mumbai', city: 'Mumbai', days_to_expiry: 31, alert_level: 'Warning' },
//       { project_id: 103, project_name: 'Skyline Apartments', rera_number: 'P52100012347', expiry_date: '2024-05-30', promoter_name: 'PQR Builders', district: 'Thane', city: 'Thane', days_to_expiry: -15, alert_level: 'Expired' }
//     ];
//   }
// };

const statusColorMap = {
  new: {
    background: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    hover: "hover:bg-blue-100",
    hex: "#3B82F6" // vibrant blue
  },
  "info-pending-syte": {
    background: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    hover: "hover:bg-amber-100",
    hex: "#F59E0B" // warm amber
  },
  "info-pending-client": {
    background: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
    hover: "hover:bg-yellow-100",
    hex: "#FCD34D" // bright yellow
  },
  "info-pending-cp": {
    background: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    hover: "hover:bg-orange-100",
    hex: "#FB923C" // vibrant orange
  },
  "govt-fees-pending": {
    background: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    hover: "hover:bg-orange-100",
    hex: "#F97316" // bright orange-red
  },
  "application-done": {
    background: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    hover: "hover:bg-green-100",
    hex: "#10B981" // success green
  },
  "scrutiny-raised": {
    background: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    hover: "hover:bg-red-100",
    hex: "#EF4444" // alert red
  },
  "scrutiny-raised-d1": {
    background: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    hover: "hover:bg-red-100",
    hex: "#F87171" // light red
  },
  "app-pending-d1": {
    background: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-200",
    hex: "#DC2626" // medium red
  },
  "scrutiny-raised-d2": {
    background: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-200",
    hex: "#B91C1C" // deeper red
  },
  "app-pending-d2": {
    background: "bg-red-200",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-300",
    hex: "#991B1B" // dark red
  },
  "scrutiny-raised-d3": {
    background: "bg-red-200",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-300",
    hex: "#7F1D1D" // darker red
  },
  "app-pending-d3": {
    background: "bg-red-300",
    text: "text-gray-100",
    border: "border-red-400",
    hover: "hover:bg-red-400",
    hex: "#450A0A" // very dark red
  },
  "scrutiny-raised-d4": {
    background: "bg-red-300",
    text: "text-gray-100",
    border: "border-red-400",
    hover: "hover:bg-red-400",
    hex: "#BE123C" // rose red
  },
  "app-pending-d4": {
    background: "bg-red-400",
    text: "text-gray-100",
    border: "border-red-500",
    hover: "hover:bg-red-500",
    hex: "#E11D48" // bright rose
  },
  "app-pending": {
    background: "bg-red-300",
    text: "text-gray-100",
    border: "border-red-400",
    hover: "hover:bg-red-400",
    hex: "#F43F5E" // vibrant rose
  },
  "certificate-generated": {
    background: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
    hover: "hover:bg-emerald-200",
    hex: "#059669" // rich emerald
  },
  close: {
    background: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
    hover: "hover:bg-gray-200",
    hex: "#64748B" // slate gray
  },
  "qpr-submitted": {
    background: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-300",
    hover: "hover:bg-purple-200",
    hex: "#8B5CF6" // vibrant purple
  },
  "form-5-submitted": {
    background: "bg-purple-200",
    text: "text-purple-900",
    border: "border-purple-400",
    hover: "hover:bg-purple-300",
    hex: "#7C3AED" // deeper purple
  },
  "form-2a-submitted": {
    background: "bg-purple-300",
    text: "text-purple-900",
    border: "border-purple-500",
    hover: "hover:bg-purple-400",
    hex: "#6D28D9" // rich purple
  },
  "work-done": {
    background: "bg-green-300",
    text: "text-green-900",
    border: "border-green-500",
    hover: "hover:bg-green-400",
    hex: "#16A34A" // forest green
  },
  "reply-to-notice-sent": {
    background: "bg-pink-100",
    text: "text-pink-800",
    border: "border-pink-300",
    hover: "hover:bg-pink-200",
    hex: "#EC4899" // bright pink
  },
  "email-sent-to-authority": {
    background: "bg-blue-200",
    text: "text-blue-900",
    border: "border-blue-400",
    hover: "hover:bg-blue-300",
    hex: "#1D4ED8" // deep blue
  },
  default: {
    background: "bg-gray-50",
    text: "text-gray-800",
    border: "border-gray-200",
    hover: "hover:bg-gray-100",
    hex: "#94A3B8" // neutral gray
  }
};

function Dashboard() {
  // Separate state for each data type
  const [generalStats, setGeneralStats] = useState(null);
  const [monthlyPromoters, setMonthlyPromoters] = useState([]);
  const [monthlyChannelPartners, setMonthlyChannelPartners] = useState([]);
  const [monthlyProjects, setMonthlyProjects] = useState([]);
  const [monthlyAssignments, setMonthlyAssignments] = useState([]);
  const [assignmentStatusSummary, setAssignmentStatusSummary] = useState([]);
  const [dailyReminders, setDailyReminders] = useState([]);
  const [monthlyFinancialSummary, setMonthlyFinancialSummary] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [reraExpiryAlerts, setReraExpiryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const URGENCY_COLORS = { 
    'Due Today': '#EF4444', 
    'Overdue': '#DC2626', 
    'Upcoming': '#10B981',
    'Critical': '#EF4444',
    'Warning': '#F59E0B',
    'Expired': '#DC2626'
  };

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data concurrently
        const [
          statsData,
          promotersData,
          channelPartnersData,
          projectsData,
          assignmentsData,
          statusSummaryData,
          remindersData,
          financialData,
          activityData,
          reraAlertsData
        ] = await Promise.all([
          databaseService.getGeneralStats(),
          databaseService.getMonthlyPromoters(),
          databaseService.getMonthlyChannelPartners(),
          databaseService.getMonthlyProjects(),
          databaseService.getMonthlyAssignments(),
          databaseService.getAssignmentStatusSummary(),
          databaseService.getDailyReminders(),
          databaseService.getMonthlyFinancialSummary(),
          databaseService.getRecentActivity(),
          databaseService.getReraExpiryAlerts()
        ]);

        // Set all state
        setGeneralStats(statsData);
        console.log(statsData);
        
        setMonthlyPromoters(promotersData);
        setMonthlyChannelPartners(channelPartnersData);
        setMonthlyProjects(projectsData);
        setMonthlyAssignments(assignmentsData);
        setAssignmentStatusSummary(statusSummaryData);
        console.log(statusSummaryData);
        
        setDailyReminders(remindersData);
        setMonthlyFinancialSummary(financialData);
        setRecentActivity(activityData);
        setReraExpiryAlerts(reraAlertsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Combine monthly data for trends chart
  const monthlyTrendsData = monthlyPromoters.map((item, index) => ({
    month: item.month_name.split(' ')[0],
    promoters: item.promoters_added,
    channelPartners: monthlyChannelPartners[index]?.channel_partners_added || 0,
    projects: monthlyProjects[index]?.projects_added || 0,
    assignments: monthlyAssignments[index]?.assignments_added || 0
  }));

  // Format financial data for chart
  const financialData = monthlyFinancialSummary.map(item => ({
    month: item.month_name.split(' ')[0],
    revenue: item.total_consultation_revenue / 100000, // Convert to lakhs
    expenses: item.total_operational_costs / 100000,
    profit: item.net_revenue / 100000
  }));

  // Function to get color for a status
const getStatusColor = (status) => {
  return statusColorMap[status]?.hex || statusColorMap.default.hex;
};

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2F4C92] mb-2"> Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights and analytics for your real estate business operations</p>
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 my-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Coverage Overview
        </h3>
        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          Live Data
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Districts Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Districts</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {generalStats?.promoter_districts_covered || '0'}
              </div>
              <div className="text-xs text-blue-600 mt-1">Coverage Areas</div>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Cities Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Cities</span>
              </div>
              <div className="text-2xl font-bold text-emerald-900">
                {generalStats?.promoter_cities_covered || '0'}
              </div>
              <div className="text-xs text-emerald-600 mt-1">Urban Centers</div>
            </div>
            <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Total Coverage:</span>
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                {generalStats?.promoter_districts_covered} Districts
              </span>
              <span className="text-gray-400">•</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                {generalStats?.promoter_cities_covered} Cities
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Updated just now
          </div>
        </div>
      </div>
    </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Promoters</p>
                <p className="text-3xl font-bold text-gray-900">{generalStats?.total_promoters.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+{generalStats?.promoters_this_month} this month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Channel Partners</p>
                <p className="text-3xl font-bold text-gray-900">{generalStats?.total_channel_partners.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+{generalStats?.channel_partners_this_month} this month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">Total Projects</p>
      <p className="text-3xl font-bold text-gray-900">{generalStats?.total_projects.toLocaleString()}</p>

      <div className="flex items-center mt-1 text-xs flex-wrap gap-x-2 gap-y-1">
        {generalStats?.residential_projects > 0 && (
          <div className=' flex flex-row flex-nowrap'>
            <Home className="h-3 w-3 mr-1 text-blue-500" />
            <span className="text-blue-600">{generalStats.residential_projects} Residential</span>
          </div>
        )}

        {generalStats?.commercial_projects > 0 && (
          <div className=' flex flex-row flex-nowrap'>
            <Building2 className="h-3 w-3 mr-1 text-orange-500" />
            <span className="text-orange-600">{generalStats.commercial_projects} Commercial</span>
          </div>
        )}

        {generalStats?.mixed_projects > 0 && (
          <div className=' flex flex-row flex-nowrap'>
            <Layers className="h-3 w-3 mr-1 text-purple-500" />
            <span className="text-purple-600">{generalStats.mixed_projects} Mixed</span>
          </div>
        )}

        {generalStats?.plotted_projects > 0 && (
          <div className=' flex flex-row flex-nowrap'>
            <MapPin className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-green-600">{generalStats.plotted_projects} Plotted</span>
          </div>
        )}
      </div>
    </div>

    <div className="p-3 bg-yellow-100 rounded-lg">
      <FileText className="h-6 w-6 text-yellow-600" />
    </div>
  </div>
</div>

<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
      <p className="text-3xl font-bold text-gray-900">
        {generalStats?.total_consultation_value >= 10000000
          ? `₹${(generalStats.total_consultation_value / 10000000).toFixed(1)}Cr`
          : generalStats?.total_consultation_value >= 100000
          ? `₹${(generalStats.total_consultation_value / 100000).toFixed(1)}L`
          : `₹${generalStats?.total_consultation_value?.toLocaleString("en-IN")}`}
      </p>
      <p className="text-xs text-green-600 mt-1">
        {generalStats?.consultation_value_this_month >= 10000000
          ? `₹${(generalStats.consultation_value_this_month / 10000000).toFixed(1)}Cr this month`
          : generalStats?.consultation_value_this_month >= 100000
          ? `₹${(generalStats.consultation_value_this_month / 100000).toFixed(1)}L this month`
          : `₹${generalStats?.consultation_value_this_month?.toLocaleString("en-IN")} this month`}
      </p>
    </div>
    <div className="p-3 bg-purple-100 rounded-lg">
      <IndianRupee className="h-6 w-6 text-purple-600" />
    </div>
  </div>
</div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Addition Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="promoters" stroke="#3B82F6" strokeWidth={3} name="Promoters" />
                <Line type="monotone" dataKey="channelPartners" stroke="#10B981" strokeWidth={3} name="Channel Partners" />
                <Line type="monotone" dataKey="projects" stroke="#F59E0B" strokeWidth={3} name="Projects" />
                <Line type="monotone" dataKey="assignments" stroke="#EF4444" strokeWidth={3} name="Assignments" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Assignment Status Distribution */}
<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Status Distribution</h3>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={assignmentStatusSummary}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        paddingAngle={5}
        dataKey="assignment_count"
        nameKey="current_status"
      >
        {assignmentStatusSummary.map((entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={getStatusColor(entry.current_status)} 
          />
        ))}
      </Pie>
      <Tooltip 
        formatter={(value, name) => [value.toLocaleString(), name]}
        contentStyle={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }} 
      />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Financial Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Financial Overview (₹ Lakhs)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => [`₹${value.toFixed(1)}L`, '']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Expenses" />
                <Area type="monotone" dataKey="profit" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Net Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Assignment Monthly Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Assignment & Revenue Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyAssignments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month_name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'assignments_added') return [value, 'Assignments'];
                    if (name === 'avg_consultation_charges') return [`₹${(value/1000).toFixed(0)}K`, 'Avg Charges'];
                    return [value, name];
                  }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Bar dataKey="assignments_added" fill="#3B82F6" name="Assignments" />
                <Bar dataKey="avg_consultation_charges" fill="#10B981" name="Avg Charges (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Reminders */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Today's Reminders
            </h3>
            <div className="space-y-3">
              {dailyReminders.slice(0, 5).map((reminder) => (
                <div key={reminder.reminder_id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    reminder.urgency === 'Overdue' ? 'bg-red-500' :
                    reminder.urgency === 'Due Today' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{reminder.assignment_type}</p>
                    <p className="text-xs text-gray-600 truncate">{reminder.project_name}</p>
                    <p className="text-xs text-gray-500 mt-1">{reminder.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        reminder.urgency === 'Overdue' ? 'bg-red-100 text-red-800' :
                        reminder.urgency === 'Due Today' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {reminder.urgency}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(reminder.date_and_time).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Recent Activity
            </h3>
<div className="space-y-3">
  {recentActivity.slice(0, 5).map((activity, index) => (
    <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
      <div className="flex-shrink-0">
        {activity.entity_type === 'Project' && <FileText className="h-4 w-4 text-blue-600 mt-1" />}
        {activity.entity_type === 'Assignment' && <Activity className="h-4 w-4 text-green-600 mt-1" />}
        {activity.entity_type === 'Promoter' && <Users className="h-4 w-4 text-purple-600 mt-1" />}
        {activity.entity_type === 'Channel Partner' && <UserCheck className="h-4 w-4 text-orange-600 mt-1" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.activity_type}</p>
        <p className="text-xs text-gray-600 truncate">{activity.entity_name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">by {activity.created_by_user}</span>
          <span className="text-xs text-gray-400">
            {new Date(activity.activity_date).toLocaleDateString()}
          </span>
        </div>
        {activity.city && (
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{activity.city}</span>
          </div>
        )}
      </div>
    </div>
  ))}
</div>

          </div>

          {/* Team Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Professionals Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Engineers</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{generalStats?.total_engineers}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Building2 className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Architects</span>
                </div>
                <span className="text-lg font-bold text-green-600">{generalStats?.total_architects}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">CAs</span>
                </div>
                <span className="text-lg font-bold text-purple-600">{generalStats?.total_cas}</span>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{generalStats?.total_assignments.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Assignments</p>
                  <p className="text-xs text-green-600 mt-1">+{generalStats?.assignments_this_month} this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

                {/* RERA Expiry Alerts */}
        {reraExpiryAlerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              RERA Expiry Alerts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reraExpiryAlerts.map((alert) => (
                <div key={alert.project_id} className={`p-4 border rounded-lg ${
                  alert.alert_level === 'Expired' ? 'border-red-200 bg-red-50' :
                  alert.alert_level === 'Critical' ? 'border-red-200 bg-red-50' :
                  'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{alert.project_name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.alert_level === 'Expired' ? 'bg-red-100 text-red-800' :
                      alert.alert_level === 'Critical' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.alert_level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">RERA: {alert.rera_number}</p>
                  <p className="text-sm text-gray-600 mb-2">{alert.promoter_name}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Expires: {new Date(alert.expiry_date).toLocaleDateString()}</span>
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {alert.city}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{generalStats?.promoter_districts_covered}</p>
              <p className="text-sm text-gray-600">Promoter Districts Covered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{generalStats?.promoter_cities_covered}</p>
              <p className="text-sm text-gray-600">Promoter Cities Covered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{generalStats?.project_districts_covered}</p>
              <p className="text-sm text-gray-600">Project Districts Covered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{generalStats?.project_cities_covered}</p>
              <p className="text-sm text-gray-600">Project Cities Covered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;