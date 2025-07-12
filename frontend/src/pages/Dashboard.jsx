import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Users,
  Building2,
  FileText,
  AlertTriangle,
  DollarSign,
  Activity,
  Building,
  Clock,
  MapPin,
  Home,
  UserCheck,
  IndianRupee,
  Layers,
  Target,
  Phone,
  Mail,
} from "lucide-react";
import databaseService from "../backend-services/database/database";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "../components";
import { useSelector } from "react-redux";

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
    hex: "#3B82F6", // vibrant blue
  },
  "info-pending-syte": {
    background: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    hover: "hover:bg-amber-100",
    hex: "#F59E0B", // warm amber
  },
  "info-pending-client": {
    background: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
    hover: "hover:bg-yellow-100",
    hex: "#FCD34D", // bright yellow
  },
  "info-pending-cp": {
    background: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    hover: "hover:bg-orange-100",
    hex: "#FB923C", // vibrant orange
  },
  "govt-fees-pending": {
    background: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    hover: "hover:bg-orange-100",
    hex: "#F97316", // bright orange-red
  },
  "application-done": {
    background: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    hover: "hover:bg-green-100",
    hex: "#10B981", // success green
  },
  "scrutiny-raised": {
    background: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    hover: "hover:bg-red-100",
    hex: "#EF4444", // alert red
  },
  "scrutiny-raised-d1": {
    background: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    hover: "hover:bg-red-100",
    hex: "#F87171", // light red
  },
  "app-pending-d1": {
    background: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-200",
    hex: "#DC2626", // medium red
  },
  "scrutiny-raised-d2": {
    background: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-200",
    hex: "#B91C1C", // deeper red
  },
  "app-pending-d2": {
    background: "bg-red-200",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-300",
    hex: "#991B1B", // dark red
  },
  "scrutiny-raised-d3": {
    background: "bg-red-200",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-300",
    hex: "#7F1D1D", // darker red
  },
  "app-pending-d3": {
    background: "bg-red-300",
    text: "text-gray-100",
    border: "border-red-400",
    hover: "hover:bg-red-400",
    hex: "#450A0A", // very dark red
  },
  "scrutiny-raised-d4": {
    background: "bg-red-300",
    text: "text-gray-100",
    border: "border-red-400",
    hover: "hover:bg-red-400",
    hex: "#BE123C", // rose red
  },
  "app-pending-d4": {
    background: "bg-red-400",
    text: "text-gray-100",
    border: "border-red-500",
    hover: "hover:bg-red-500",
    hex: "#E11D48", // bright rose
  },
  "app-pending": {
    background: "bg-red-300",
    text: "text-gray-100",
    border: "border-red-400",
    hover: "hover:bg-red-400",
    hex: "#F43F5E", // vibrant rose
  },
  "certificate-generated": {
    background: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
    hover: "hover:bg-emerald-200",
    hex: "#059669", // rich emerald
  },
  close: {
    background: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
    hover: "hover:bg-gray-200",
    hex: "#64748B", // slate gray
  },
  "qpr-submitted": {
    background: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-300",
    hover: "hover:bg-purple-200",
    hex: "#8B5CF6", // vibrant purple
  },
  "form-5-submitted": {
    background: "bg-purple-200",
    text: "text-purple-900",
    border: "border-purple-400",
    hover: "hover:bg-purple-300",
    hex: "#7C3AED", // deeper purple
  },
  "form-2a-submitted": {
    background: "bg-purple-300",
    text: "text-purple-900",
    border: "border-purple-500",
    hover: "hover:bg-purple-400",
    hex: "#6D28D9", // rich purple
  },
  "work-done": {
    background: "bg-green-300",
    text: "text-green-900",
    border: "border-green-500",
    hover: "hover:bg-green-400",
    hex: "#16A34A", // forest green
  },
  "reply-to-notice-sent": {
    background: "bg-pink-100",
    text: "text-pink-800",
    border: "border-pink-300",
    hover: "hover:bg-pink-200",
    hex: "#EC4899", // bright pink
  },
  "email-sent-to-authority": {
    background: "bg-blue-200",
    text: "text-blue-900",
    border: "border-blue-400",
    hover: "hover:bg-blue-300",
    hex: "#1D4ED8", // deep blue
  },
  default: {
    background: "bg-gray-50",
    text: "text-gray-800",
    border: "border-gray-200",
    hover: "hover:bg-gray-100",
    hex: "#94A3B8", // neutral gray
  },
};

function Dashboard() {
  const navigate = useNavigate();
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

  const userData = useSelector(state => state.auth.userData);
  const isAdmin = userData && userData.role === 'admin';
  const userAccessFields = userData?.access_fields || [];

  if (!isAdmin && !userAccessFields.includes('dashboard')) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access the Dashboard.</p>
      </div>
    </div>
  );
}

  // Colors for charts
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];
  const URGENCY_COLORS = {
    "Due Today": "#EF4444",
    Overdue: "#DC2626",
    Upcoming: "#10B981",
    Critical: "#EF4444",
    Warning: "#F59E0B",
    Expired: "#DC2626",
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
          reraAlertsData,
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
          databaseService.getReraExpiryAlerts(),
        ]);

        console.log('statusSummaryData: ',statusSummaryData)

        // Set all state
        setGeneralStats(statsData);
        setMonthlyPromoters(promotersData);
        setMonthlyChannelPartners(channelPartnersData);
        setMonthlyProjects(projectsData);
        setMonthlyAssignments(assignmentsData);
        setAssignmentStatusSummary(statusSummaryData);
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
    month: item.month_name.split(" ")[0],
    promoters: item.promoters_added,
    channelPartners: monthlyChannelPartners[index]?.channel_partners_added || 0,
    projects: monthlyProjects[index]?.projects_added || 0,
    assignments: monthlyAssignments[index]?.assignments_added || 0,
  }));

  // Format financial data for chart
  const financialData = monthlyFinancialSummary.map((item) => ({
    month: item.month_name.split(" ")[0],
    revenue: item.total_consultation_revenue / 100000, // Convert to lakhs
    expenses: item.total_operational_costs / 100000,
    profit: item.net_revenue / 100000,
  }));

  // Function to get color for a status
  const getStatusColor = (status) => {
    return statusColorMap[status]?.hex || statusColorMap.default.hex;
  };

  // Status styling function
  const getStatusStylesForUnit = (status) => {
    const statusStyleMap = {
      Sold: "bg-gray-100 text-gray-800",
      Unsold: "bg-blue-100 text-blue-800",
      Booked: "bg-yellow-100 text-yellow-800",
      Mortgage: "bg-orange-100 text-orange-800",
      Reservation: "bg-purple-100 text-purple-800",
      Rehab: "bg-indigo-100 text-indigo-800",
      "Land Owner/Investor Share (Not for Sale)": "bg-red-100 text-red-800",
      "Land Owner/Investor Share (for Sale)": "bg-green-100 text-green-800",
    };

    return statusStyleMap[status] || "bg-gray-100 text-gray-600";
  };

  const handleViewDetails = (activity) => {
    const { entity_type, entity_id } = activity;

    // Map entity types to their corresponding view routes
    const routeMap = {
      "Channel Partner": `/channel-partners/view/${entity_id}`,
      Promoter: `/promoters/view/${entity_id}`,
      Project: `/projects/view/${entity_id}`,
      Assignment: `/assignments/view/${entity_id}`,
      unit: `/projects`,
    };

    // Get the route for the entity type
    const route = routeMap[entity_type];

    if (route) {
      navigate(route);
    } else {
      console.warn(`Unknown entity type: ${entity_type}`);
      // Optional: Show a toast or alert to the user
    }
  };
  const handleEditDetails = (activity) => {
    const { entity_type, entity_id } = activity;

    // Map entity types to their corresponding view routes
    const routeMap = {
      "Channel Partner": `/channel-partners/edit/${entity_id}`,
      Promoter: `/promoters/edit/${entity_id}`,
      Project: `/projects/edit/${entity_id}`,
      Assignment: `/assignments/edit/${entity_id}`,
      unit: `/projects`,
    };

    // Get the route for the entity type
    const route = routeMap[entity_type];

    if (route) {
      navigate(route);
    } else {
      console.warn(`Unknown entity type: ${entity_type}`);
      // Optional: Show a toast or alert to the user
    }
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2F4C92] mb-2"> Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive insights and analytics for your real estate business
            operations
          </p>
          </div>
          <UserProfile />
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Promoters
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {generalStats?.total_promoters.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{generalStats?.promoters_this_month} this month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Channel Partners
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {generalStats?.total_channel_partners.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{generalStats?.channel_partners_this_month} this month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Projects
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {generalStats?.total_projects.toLocaleString()}
                </p>

                <div className="flex items-center mt-1 text-xs flex-wrap gap-x-2 gap-y-1">
                  {generalStats?.residential_projects > 0 && (
                    <div className=" flex flex-row flex-nowrap">
                      <Home className="h-3 w-3 mr-1 text-blue-500" />
                      <span className="text-blue-600">
                        {generalStats.residential_projects} Residential
                      </span>
                    </div>
                  )}

                  {generalStats?.commercial_projects > 0 && (
                    <div className=" flex flex-row flex-nowrap">
                      <Building2 className="h-3 w-3 mr-1 text-orange-500" />
                      <span className="text-orange-600">
                        {generalStats.commercial_projects} Commercial
                      </span>
                    </div>
                  )}

                  {generalStats?.mixed_projects > 0 && (
                    <div className=" flex flex-row flex-nowrap">
                      <Layers className="h-3 w-3 mr-1 text-purple-500" />
                      <span className="text-purple-600">
                        {generalStats.mixed_projects} Mixed
                      </span>
                    </div>
                  )}

                  {generalStats?.plotted_projects > 0 && (
                    <div className=" flex flex-row flex-nowrap">
                      <MapPin className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-green-600">
                        {generalStats.plotted_projects} Plotted
                      </span>
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
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {generalStats?.total_consultation_value >= 10000000
                    ? `₹${(
                        generalStats.total_consultation_value / 10000000
                      ).toFixed(1)}Cr`
                    : generalStats?.total_consultation_value >= 100000
                    ? `₹${(
                        generalStats.total_consultation_value / 100000
                      ).toFixed(1)}L`
                    : `₹${generalStats?.total_consultation_value?.toLocaleString(
                        "en-IN"
                      )}`}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {generalStats?.consultation_value_this_month >= 10000000
                    ? `₹${(
                        generalStats.consultation_value_this_month / 10000000
                      ).toFixed(1)}Cr this month`
                    : generalStats?.consultation_value_this_month >= 100000
                    ? `₹${(
                        generalStats.consultation_value_this_month / 100000
                      ).toFixed(1)}L this month`
                    : `₹${generalStats?.consultation_value_this_month?.toLocaleString(
                        "en-IN"
                      )} this month`}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <IndianRupee className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <ChannelPartnerCoverage generalStats={generalStats} />

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Addition Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="promoters"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Promoters"
                />
                <Line
                  type="monotone"
                  dataKey="channelPartners"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Channel Partners"
                />
                <Line
                  type="monotone"
                  dataKey="projects"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  name="Projects"
                />
                <Line
                  type="monotone"
                  dataKey="assignments"
                  stroke="#EF4444"
                  strokeWidth={3}
                  name="Assignments"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Assignment Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assignment Status Distribution
            </h3>
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
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
            <FinancialChart monthlyFinancialSummary={monthlyFinancialSummary} />
          </div>

          {/* Assignment Monthly Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <AssignmentTrendsChart monthlyAssignments={monthlyAssignments} />
          </div>
        </div>

        <ProjectsCoverage generalStats={generalStats} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Promoters Coverage
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
                    <span className="text-sm font-medium text-blue-700">
                      Districts
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {generalStats?.promoter_districts_covered || "0"}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Coverage Areas
                  </div>
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
                    <span className="text-sm font-medium text-emerald-700">
                      Cities
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">
                    {generalStats?.promoter_cities_covered || "0"}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">
                    Urban and Rural Centers
                  </div>
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
              <div className="text-xs text-gray-400">Updated just now</div>
            </div>
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
            <div
              className="space-y-3 max-h-96 overflow-y-auto pr-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 #f1f5f9",
              }}
            >
              {dailyReminders.slice(0, 5).map((reminder) => (
                <div
                  key={reminder.reminder_id}
                  className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow duration-200"
                >
                  <div
                    className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                      reminder.reminder_status === "completed"
                        ? "bg-green-500"
                        : reminder.urgency === "Overdue"
                        ? "bg-red-500"
                        : reminder.urgency === "Due Today"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  ></div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {reminder.assignment_type}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                          reminder.reminder_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : reminder.reminder_status === "pending"
                            ? "bg-blue-100 text-blue-800"
                            : reminder.reminder_status === "cancelled"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {reminder.reminder_status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 truncate mb-2">
                      {reminder.project_name}
                    </p>

                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {reminder.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          reminder.reminder_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : reminder.urgency === "Overdue"
                            ? "bg-red-100 text-red-800"
                            : reminder.urgency === "Due Today"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {reminder.reminder_status === "completed"
                          ? "Completed"
                          : reminder.urgency}
                      </span>

                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(reminder.date_and_time).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
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

            <div
              className="space-y-3 max-h-96 overflow-y-auto pr-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 #f1f5f9",
              }}
            >
              {recentActivity.slice(0, 5).map((activity, index) => {
                // Parse additional_info if it's a JSON string
                let additionalInfo = {};
                try {
                  additionalInfo =
                    typeof activity.additional_info === "string"
                      ? JSON.parse(activity.additional_info)
                      : activity.additional_info || {};
                } catch (e) {
                  additionalInfo = {};
                }

                // Dynamic icon and color based on activity category
                const getActivityIcon = () => {
                  switch (activity.activity_category) {
                    case "promoter_added":
                      return <Users className="h-4 w-4 text-purple-600" />;
                    case "project_added":
                      return <FileText className="h-4 w-4 text-blue-600" />;
                    case "assignment_created":
                      return <Activity className="h-4 w-4 text-green-600" />;
                    case "channel_partner_added":
                      return <UserCheck className="h-4 w-4 text-orange-600" />;
                    case "unit_added":
                      return <Home className="h-4 w-4 text-indigo-600" />;
                    default:
                      return <Activity className="h-4 w-4 text-gray-600" />;
                  }
                };

                const getIconBackground = () => {
                  switch (activity.activity_category) {
                    case "promoter_added":
                      return "bg-purple-100";
                    case "project_added":
                      return "bg-blue-100";
                    case "assignment_created":
                      return "bg-green-100";
                    case "channel_partner_added":
                      return "bg-orange-100";
                    case "unit_added":
                      return "bg-indigo-100";
                    default:
                      return "bg-gray-100";
                  }
                };

                // Get time ago color based on activity age
                const getTimeColor = () => {
                  switch (activity.activity_age) {
                    case "recent":
                      return "text-green-500 font-medium";
                    case "today":
                      return "text-blue-500";
                    case "this_week":
                      return "text-orange-500";
                    default:
                      return "text-gray-400";
                  }
                };

                return (
                  <div
                    key={`${activity.entity_type}-${activity.entity_id}-${index}`}
                    className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
                    style={{
                      borderLeftColor: activity.activity_color || "#6b7280",
                      borderLeftWidth: "3px",
                    }}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 ${getIconBackground()} rounded-full flex items-center justify-center`}
                      >
                        {getActivityIcon()}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Main activity description */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 leading-5">
                            {activity.activity_type}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 font-medium">
                            {activity.entity_name}
                          </p>
                        </div>
                        <span
                          className={`text-xs whitespace-nowrap ml-2 ${getTimeColor()}`}
                        >
                          {activity.time_ago ||
                            new Date(
                              activity.activity_date
                            ).toLocaleDateString()}
                        </span>
                      </div>

                      {/* User and location information */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <span>by </span>
                          <span className="font-medium ml-1">
                            {activity.created_by_name ||
                              `User ${activity.created_by_user}`}
                          </span>
                        </div>

                        {activity.location_display &&
                          activity.location_display !==
                            "Location not specified" &&
                          activity.location_display !== "Assignment Details" &&
                          activity.location_display !== "Project location" && (
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate max-w-32">
                                {activity.location_display}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* Enhanced additional information display */}
                      {Object.keys(additionalInfo).length > 0 && (
                        <div className="mt-3 space-y-1">
                          {/* Contact information for promoters and channel partners */}
                          {(additionalInfo.contact || additionalInfo.email) && (
                            <div className="flex items-center text-xs text-gray-600 space-x-3">
                              {additionalInfo.contact &&
                                additionalInfo.contact !== "Not provided" && (
                                  <span className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {additionalInfo.contact}
                                  </span>
                                )}
                              {additionalInfo.email &&
                                additionalInfo.email !== "Not provided" && (
                                  <span className="flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {additionalInfo.email}
                                  </span>
                                )}
                            </div>
                          )}

                          {/* Project-specific information */}
                          {additionalInfo.project_name && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Project:</span>{" "}
                              {additionalInfo.project_name}
                            </div>
                          )}

                          {/* Type information */}
                          {additionalInfo.type &&
                            additionalInfo.type !== "Not specified" && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Type:</span>{" "}
                                {additionalInfo.type}
                              </div>
                            )}

                          {/* Financial information for assignments */}
                          {additionalInfo.consultation_charges &&
                            additionalInfo.consultation_charges !==
                              "Not specified" && (
                              <div className="text-xs text-green-700 font-medium bg-green-50 px-2 py-1 rounded">
                                <IndianRupee className="h-3 w-3 inline mr-1" />
                                {additionalInfo.consultation_charges}
                              </div>
                            )}

                          {/* Unit-specific information */}
                          {additionalInfo.carpet_area &&
                            additionalInfo.carpet_area !== "Not specified" && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Area:</span>{" "}
                                {additionalInfo.carpet_area}
                              </div>
                            )}

                          {additionalInfo.unit_status && (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStylesForUnit(
                                additionalInfo.unit_status
                              )}`}
                            >
                              {additionalInfo.unit_status}
                            </span>
                          )}

                          {/* Customer information for units */}
                          {additionalInfo.customer_name &&
                            additionalInfo.customer_name !== "Not assigned" && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Customer:</span>{" "}
                                {additionalInfo.customer_name}
                              </div>
                            )}

                          {/* Application and RERA information */}
                          {additionalInfo.application_number &&
                            additionalInfo.application_number !==
                              "Not assigned" && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">App No:</span>{" "}
                                {additionalInfo.application_number}
                              </div>
                            )}

                          {additionalInfo.rera_number &&
                            additionalInfo.rera_number !== "Not provided" && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">RERA:</span>{" "}
                                {additionalInfo.rera_number}
                              </div>
                            )}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center mt-3 space-x-2">
                        {activity.entity_type !== "Project Unit" && (
                          <>
                            <button
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                              onClick={() => {
                                console.log(
                                  `View ${activity.entity_type}:`,
                                  activity.entity_id
                                );
                                handleViewDetails(activity);
                              }}
                            >
                              View Details
                            </button>

                            <span className="text-gray-300">•</span>
                            <button
                              className="text-xs text-green-600 hover:text-green-800 font-medium transition-colors duration-150"
                              onClick={() => {
                                // Handle edit action
                                console.log(
                                  `Edit ${activity.entity_type}:`,
                                  activity.entity_id
                                );
                                handleEditDetails(activity);
                              }}
                            >
                              Edit
                            </button>
                          </>
                        )}

                        {/* Quick action based on entity type */}
                        {/* {activity.entity_type === 'Project' && (
                <>
                  <span className="text-gray-300">•</span>
                  <button 
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors duration-150"
                    onClick={() => {
                      console.log(`Add Unit to Project:`, activity.entity_id);
                    }}
                  >
                    Add Unit
                  </button>
                </>
              )} */}

                        {/* {activity.entity_type === 'Assignment' && (
                <>
                  <span className="text-gray-300">•</span>
                  <button 
                    className="text-xs text-orange-600 hover:text-orange-800 font-medium transition-colors duration-150"
                    onClick={() => {
                      console.log(`Update Status for Assignment:`, activity.entity_id);
                    }}
                  >
                    Update Status
                  </button>
                </>
              )} */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Project Professionals Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Engineers
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {generalStats?.total_engineers}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Building2 className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Architects
                  </span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {generalStats?.total_architects}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">CAs</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {generalStats?.total_cas}
                </span>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {generalStats?.total_assignments.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Assignments</p>
                  <p className="text-xs text-green-600 mt-1">
                    +{generalStats?.assignments_this_month} this month
                  </p>
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
                <div
                  key={alert.project_id}
                  className={`p-4 border rounded-lg ${
                    alert.alert_level === "Expired"
                      ? "border-red-200 bg-red-50"
                      : alert.alert_level === "Critical"
                      ? "border-red-200 bg-red-50"
                      : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {alert.project_name}
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        alert.alert_level === "Expired"
                          ? "bg-red-100 text-red-800"
                          : alert.alert_level === "Critical"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {alert.alert_level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    RERA: {alert.rera_number}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {alert.promoter_name}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Expires:{" "}
                      {new Date(alert.expiry_date).toLocaleDateString()}
                    </span>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
              <p className="text-2xl font-bold text-purple-600">
                {generalStats?.channel_partner_districts_covered}
              </p>
              <p className="text-sm text-purple-700 font-medium">
                Channel Partner Districts Covered
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow duration-200">
              <p className="text-2xl font-bold text-purple-600">
                {generalStats?.channel_partner_cities_covered}
              </p>
              <p className="text-sm text-purple-700 font-medium">
                Channel Partner Cities Covered
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200">
              <p className="text-2xl font-bold text-blue-600">
                {generalStats?.promoter_districts_covered}
              </p>
              <p className="text-sm text-blue-700 font-medium">
                Promoter Districts Covered
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow duration-200">
              <p className="text-2xl font-bold text-blue-600">
                {generalStats?.promoter_cities_covered}
              </p>
              <p className="text-sm text-blue-700 font-medium">
                Promoter Cities Covered
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow duration-200">
              <p className="text-2xl font-bold text-green-600">
                {generalStats?.project_districts_covered}
              </p>
              <p className="text-sm text-green-700 font-medium">
                Project Districts Covered
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow duration-200">
              <p className="text-2xl font-bold text-green-600">
                {generalStats?.project_cities_covered}
              </p>
              <p className="text-sm text-green-700 font-medium">
                Project Cities Covered
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ChannelPartnerCoverage = ({ generalStats }) => {
  // Total districts in Maharashtra
  const TOTAL_MAHARASHTRA_DISTRICTS = 36;

  const districtsCoVered = generalStats?.channel_partner_districts_covered || 0;
  const citiesCovered = generalStats?.channel_partner_cities_covered || 0;
  const coveragePercentage = Math.round(
    (districtsCoVered / TOTAL_MAHARASHTRA_DISTRICTS) * 100
  );
  const uncoveredDistricts = TOTAL_MAHARASHTRA_DISTRICTS - districtsCoVered;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Channel Partner Coverage
        </h3>
        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          Live Data
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Districts Covered Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Districts Covered
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {districtsCoVered}/36
              </div>
              <div className="text-xs text-purple-600 mt-1">
                out of {TOTAL_MAHARASHTRA_DISTRICTS}
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Cities Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">
                  Cities
                </span>
              </div>
              <div className="text-2xl font-bold text-indigo-900">
                {citiesCovered}
              </div>
              <div className="text-xs text-indigo-600 mt-1">Urban and Rural Centers</div>
            </div>
            <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Coverage Percentage Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  Coverage %
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-900">
                {coveragePercentage}%
              </div>
              <div className="text-xs text-emerald-600 mt-1">
                of Maharashtra
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar for Maharashtra Coverage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Maharashtra District Coverage
          </span>
          <span className="text-sm text-gray-500">
            {districtsCoVered}/{TOTAL_MAHARASHTRA_DISTRICTS}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${coveragePercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-1">
            Coverage Status
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {districtsCoVered} Districts Active
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {uncoveredDistricts} Districts Potential
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-1">
            Expansion Opportunity
          </div>
          <div className="text-lg font-bold text-orange-600">
            {uncoveredDistricts}
          </div>
          <div className="text-xs text-gray-500">Uncovered Districts</div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Channel Partner Reach:</span>
            <div className="flex items-center gap-3">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                {districtsCoVered} Districts
              </span>
              <span className="text-gray-400">•</span>
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
                {citiesCovered} Cities
              </span>
              <span className="text-gray-400">•</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                {coveragePercentage}% Coverage
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-400">Updated just now</div>
        </div>
      </div>
    </div>
  );
};

const ProjectsCoverage = ({ generalStats }) => {
  // Total districts in Maharashtra
  const TOTAL_MAHARASHTRA_DISTRICTS = 36;

  const districtsCoVered = generalStats?.project_districts_covered || 0;
  const citiesCovered = generalStats?.project_cities_covered || 0;
  const coveragePercentage = Math.round(
    (districtsCoVered / TOTAL_MAHARASHTRA_DISTRICTS) * 100
  );
  const uncoveredDistricts = TOTAL_MAHARASHTRA_DISTRICTS - districtsCoVered;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building className="w-5 h-5 text-orange-600" />
          Projects Coverage
        </h3>
        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          Live Data
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Districts Covered Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">
                  Districts Covered
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {districtsCoVered}
              </div>
              <div className="text-xs text-orange-600 mt-1">
                out of {TOTAL_MAHARASHTRA_DISTRICTS}
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Cities Card */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  Cities
                </span>
              </div>
              <div className="text-2xl font-bold text-amber-900">
                {citiesCovered}
              </div>
              <div className="text-xs text-amber-600 mt-1">
                Project Locations
              </div>
            </div>
            <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Coverage Percentage Card */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-700">
                  Coverage %
                </span>
              </div>
              <div className="text-2xl font-bold text-teal-900">
                {coveragePercentage}%
              </div>
              <div className="text-xs text-teal-600 mt-1">of Maharashtra</div>
            </div>
            <div className="w-12 h-12 bg-teal-200 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar for Maharashtra Coverage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Maharashtra District Coverage
          </span>
          <span className="text-sm text-gray-500">
            {districtsCoVered}/{TOTAL_MAHARASHTRA_DISTRICTS}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${coveragePercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-1">
            Project Distribution
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {districtsCoVered} Districts Active
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {uncoveredDistricts} Districts Available
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-1">
            Market Potential
          </div>
          <div className="text-lg font-bold text-orange-600">
            {uncoveredDistricts}
          </div>
          <div className="text-xs text-gray-500">Unexplored Districts</div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Project Reach:</span>
            <div className="flex items-center gap-3">
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                {districtsCoVered} Districts
              </span>
              <span className="text-gray-400">•</span>
              <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                {citiesCovered} Cities
              </span>
              <span className="text-gray-400">•</span>
              <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-medium">
                {coveragePercentage}% Coverage
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-400">Updated just now</div>
        </div>
      </div>
    </div>
  );
};

const FinancialChart = ({monthlyFinancialSummary }) => {
  const [selectedUnit, setSelectedUnit] = useState('lakhs');

  // Unit configuration
  const unitConfig = {
    thousands: {
      divisor: 1000,
      symbol: 'K',
      label: 'Thousands',
      formatter: (value) => `₹${value.toFixed(0)}K`
    },
    lakhs: {
      divisor: 100000,
      symbol: 'L',
      label: 'Lakhs',
      formatter: (value) => `₹${value.toFixed(1)}L`
    },
    crores: {
      divisor: 10000000,
      symbol: 'Cr',
      label: 'Crores',
      formatter: (value) => `₹${value.toFixed(2)}Cr`
    }
  };

  // Convert data based on selected unit
  const getFinancialData = () => {
    const config = unitConfig[selectedUnit];
    return monthlyFinancialSummary.map((item) => ({
      month: item.month_name.split(" ")[0],
      revenue: item.total_consultation_revenue / config.divisor,
      expenses: item.total_operational_costs / config.divisor,
      profit: item.net_revenue / config.divisor,
    }));
  };

  const financialData = getFinancialData();
  const currentConfig = unitConfig[selectedUnit];

  // Custom tooltip formatter
  const tooltipFormatter = (value, name) => {
    return [currentConfig.formatter(value), name];
  };

  // Y-axis label formatter
  const yAxisFormatter = (value) => {
    if (selectedUnit === 'crores') {
      return value.toFixed(1);
    } else if (selectedUnit === 'lakhs') {
      return value.toFixed(0);
    } else {
      return Math.round(value);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Financial Overview</h3>
          
          {/* Unit Selection Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="unit-select" className="text-sm font-medium text-gray-600">
              Display in:
            </label>
            <select
              id="unit-select"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(unitConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label} ({config.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Unit Selection Buttons (Alternative) */}
        <div className="flex gap-2 mb-4">
          {Object.entries(unitConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedUnit(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedUnit === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={financialData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={yAxisFormatter}
            label={{ 
              value: `Amount (${currentConfig.symbol})`, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stackId="1"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.6}
            name="Revenue"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stackId="2"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.6}
            name="Expenses"
          />
          <Area
            type="monotone"
            dataKey="profit"
            stackId="3"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.6}
            name="Net Profit"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {financialData.length > 0 && (
          <>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Latest Revenue</h3>
              <p className="text-2xl font-bold text-blue-600">
                {currentConfig.formatter(financialData[financialData.length - 1].revenue)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-800">Latest Expenses</h3>
              <p className="text-2xl font-bold text-red-600">
                {currentConfig.formatter(financialData[financialData.length - 1].expenses)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Latest Profit</h3>
              <p className="text-2xl font-bold text-green-600">
                {currentConfig.formatter(financialData[financialData.length - 1].profit)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const AssignmentTrendsChart = ({ monthlyAssignments }) => {
  const [selectedUnit, setSelectedUnit] = useState('thousands');

  // Unit configuration for charges - keeping original 'actual' option plus FinancialChart alignment
  const unitConfig = {
    actual: {
      divisor: 1,
      symbol: '₹',
      label: 'Actual',
      formatter: (value) => `₹${value.toLocaleString()}`
    },
    thousands: {
      divisor: 1000,
      symbol: 'K',
      label: 'Thousands',
      formatter: (value) => `₹${value.toFixed(0)}K`
    },
    lakhs: {
      divisor: 100000,
      symbol: 'L',
      label: 'Lakhs',
      formatter: (value) => `₹${value.toFixed(1)}L`
    },
    crores: {
      divisor: 10000000,
      symbol: 'Cr',
      label: 'Crores',
      formatter: (value) => `₹${value.toFixed(2)}Cr`
    }
  };

  // Transform data based on selected unit - keeping original logic
  const getTransformedData = () => {
    const config = unitConfig[selectedUnit];
    return monthlyAssignments.map((item) => ({
      ...item,
      month: item.month_name.split(' ')[0], // Short month name
      avg_consultation_charges_formatted: item.avg_consultation_charges / config.divisor,
      // Keep original for calculations
      original_charges: item.avg_consultation_charges
    }));
  };

  const transformedData = getTransformedData();
  const currentConfig = unitConfig[selectedUnit];

  // Custom tooltip formatter - keeping original logic
  const tooltipFormatter = (value, name, props) => {
    if (name === "assignments_added") {
      return [value, "Assignments"];
    }
    if (name === "avg_consultation_charges_formatted") {
      return [currentConfig.formatter(value), "Avg Charges"];
    }
    return [value, name];
  };

  // Y-axis label formatter - similar to FinancialChart
  const yAxisFormatter = (value) => {
    if (selectedUnit === 'crores') {
      return value.toFixed(1);
    } else if (selectedUnit === 'lakhs') {
      return value.toFixed(0);
    } else {
      return Math.round(value);
    }
  };

  // Calculate statistics - keeping original calculations
  const totalAssignments = transformedData.reduce((sum, item) => sum + item.assignments_added, 0);
  const avgCharges = transformedData.reduce((sum, item) => sum + item.original_charges, 0) / transformedData.length;
  const maxAssignments = Math.max(...transformedData.map(item => item.assignments_added));

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Monthly Assignment & Revenue Trends
          </h3>
          
          {/* Unit Selection Dropdown - same as FinancialChart */}
          <div className="flex items-center gap-2">
            <label htmlFor="unit-select-assignments" className="text-sm font-medium text-gray-600">
              Display in:
            </label>
            <select
              id="unit-select-assignments"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(unitConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label} ({config.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Unit Selection Buttons - same as FinancialChart */}
        <div className="flex gap-2 mb-4">
          {Object.entries(unitConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedUnit(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedUnit === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart - using ResponsiveContainer and similar styling */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={transformedData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={yAxisFormatter}
          />
          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Bar
            dataKey="assignments_added"
            fill="#3B82F6"
            name="Assignments"
          />
          <Bar
            dataKey="avg_consultation_charges_formatted"
            fill="#10B981"
            name={`Avg Charges (${currentConfig.symbol})`}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Cards - same style as FinancialChart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {transformedData.length > 0 && (
          <>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Total Assignments</h3>
              <p className="text-2xl font-bold text-blue-600">{totalAssignments}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Avg Charges</h3>
              <p className="text-2xl font-bold text-green-600">
                {currentConfig.formatter(avgCharges / currentConfig.divisor)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">Peak Month</h3>
              <p className="text-2xl font-bold text-purple-600">{maxAssignments}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default Dashboard;