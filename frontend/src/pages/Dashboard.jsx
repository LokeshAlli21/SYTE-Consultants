import React, { useEffect, useState } from 'react';
import databaseService from "../backend-services/database/database"; // Assuming this path is correct
import { toast } from 'react-toastify'; // Assuming you have react-toastify configured

function Dashboard() {

  // State for all dashboard data
  const [monthlyPromoters, setMonthlyPromoters] = useState(null);
  const [monthlyChannelPartners, setMonthlyChannelPartners] = useState(null);
  const [monthlyProjects, setMonthlyProjects] = useState(null);
  const [monthlyAssignments, setMonthlyAssignments] = useState(null);
  const [assignmentStatusSummary, setAssignmentStatusSummary] = useState(null);
  const [assignmentTypeSummary, setAssignmentTypeSummary] = useState(null);
  const [dailyReminders, setDailyReminders] = useState(null);
  const [generalStats, setGeneralStats] = useState(null);
  const [promoterTypeDistribution, setPromoterTypeDistribution] = useState(null);
  const [promoterGeographicDistribution, setPromoterGeographicDistribution] = useState(null);
  const [projectOverview, setProjectOverview] = useState(null);
  const [reraExpiryAlerts, setReraExpiryAlerts] = useState(null);
  const [monthlyFinancialSummary, setMonthlyFinancialSummary] = useState(null);
  const [assignmentFinancialPerformance, setAssignmentFinancialPerformance] = useState(null);
  const [userActivitySummary, setUserActivitySummary] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [completeDashboardData, setCompleteDashboardData] = useState(null);
  const [dashboardOverview, setDashboardOverview] = useState(null);
  const [quickStats, setQuickStats] = useState(null);

  // Helper function to fetch data for a specific method and set state
  const fetchData = async (methodName, setterFunction, params = {}) => {
    try {
      const data = await databaseService[methodName](params);
      setterFunction(data);
      console.log(`✅ Fetched ${methodName} data:`, data);
    } catch (error) {
      console.error(`❌ Error fetching ${methodName} data:`, error);
      toast.error(`Failed to load ${methodName} data`);
      setterFunction(null); // Clear data on error
    }
  };

  useEffect(() => {
    async function fetchAllDashboardData() {
      // Monthly Trends
      await fetchData('getMonthlyPromoters', setMonthlyPromoters);
      await fetchData('getMonthlyChannelPartners', setMonthlyChannelPartners);
      await fetchData('getMonthlyProjects', setMonthlyProjects);
      await fetchData('getMonthlyAssignments', setMonthlyAssignments);

      // Assignment Status Summary
      await fetchData('getAssignmentStatusSummary', setAssignmentStatusSummary);
      await fetchData('getAssignmentTypeSummary', setAssignmentTypeSummary);

      // Daily Reminders and Tasks
      await fetchData('getDailyReminders', setDailyReminders);

      // General Statistics
      await fetchData('getGeneralStats', setGeneralStats);

      // Promoter Insights
      await fetchData('getPromoterTypeDistribution', setPromoterTypeDistribution);
      await fetchData('getPromoterGeographicDistribution', setPromoterGeographicDistribution, { district: 'Mumbai' });

      // Project Insights
      await fetchData('getProjectOverview', setProjectOverview, { limit: 5, rera_status: 'ongoing' });
      await fetchData('getReraExpiryAlerts', setReraExpiryAlerts, { days_ahead: 60, alert_level: 'critical' });

      // Financial Insights
      await fetchData('getMonthlyFinancialSummary', setMonthlyFinancialSummary, { year: 2024, limit: 3 });
      await fetchData('getAssignmentFinancialPerformance', setAssignmentFinancialPerformance, { assignment_type: 'Sales' });

      // Activity and Productivity Metrics
      await fetchData('getUserActivitySummary', setUserActivitySummary, { limit: 5 });
      await fetchData('getRecentActivity', setRecentActivity, { days_back: 15, activity_type: 'login' });

      // Combined Dashboard Data
      await fetchData('getCompleteDashboardData', setCompleteDashboardData);
      await fetchData('getDashboardOverview', setDashboardOverview); // Alias
      await fetchData('getQuickStats', setQuickStats); // Alias
    }

    fetchAllDashboardData();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Basic Dashboard Data Display</h1>

      <h2>Monthly Trends</h2>
      <h3>Monthly Promoters</h3>
      <pre>{JSON.stringify(monthlyPromoters, null, 2)}</pre>
      <h3>Monthly Channel Partners</h3>
      <pre>{JSON.stringify(monthlyChannelPartners, null, 2)}</pre>
      <h3>Monthly Projects</h3>
      <pre>{JSON.stringify(monthlyProjects, null, 2)}</pre>
      <h3>Monthly Assignments</h3>
      <pre>{JSON.stringify(monthlyAssignments, null, 2)}</pre>

      <h2>Assignment Status Summary</h2>
      <h3>Assignment Status Summary</h3>
      <pre>{JSON.stringify(assignmentStatusSummary, null, 2)}</pre>
      <h3>Assignment Type Summary</h3>
      <pre>{JSON.stringify(assignmentTypeSummary, null, 2)}</pre>

      <h2>Daily Reminders and Tasks</h2>
      <h3>Daily Reminders</h3>
      <pre>{JSON.stringify(dailyReminders, null, 2)}</pre>

      <h2>General Statistics</h2>
      <h3>General Stats</h3>
      <pre>{JSON.stringify(generalStats, null, 2)}</pre>

      <h2>Promoter Insights</h2>
      <h3>Promoter Type Distribution</h3>
      <pre>{JSON.stringify(promoterTypeDistribution, null, 2)}</pre>
      <h3>Promoter Geographic Distribution</h3>
      <pre>{JSON.stringify(promoterGeographicDistribution, null, 2)}</pre>

      <h2>Project Insights</h2>
      <h3>Project Overview</h3>
      <pre>{JSON.stringify(projectOverview, null, 2)}</pre>
      <h3>RERA Expiry Alerts</h3>
      <pre>{JSON.stringify(reraExpiryAlerts, null, 2)}</pre>

      <h2>Financial Insights</h2>
      <h3>Monthly Financial Summary</h3>
      <pre>{JSON.stringify(monthlyFinancialSummary, null, 2)}</pre>
      <h3>Assignment Financial Performance</h3>
      <pre>{JSON.stringify(assignmentFinancialPerformance, null, 2)}</pre>

      <h2>Activity and Productivity Metrics</h2>
      <h3>User Activity Summary</h3>
      <pre>{JSON.stringify(userActivitySummary, null, 2)}</pre>
      <h3>Recent Activity</h3>
      <pre>{JSON.stringify(recentActivity, null, 2)}</pre>

      <h2>Combined Dashboard Data</h2>
      <h3>Complete Dashboard Data</h3>
      <pre>{JSON.stringify(completeDashboardData, null, 2)}</pre>
      <h3>Dashboard Overview (Alias)</h3>
      <pre>{JSON.stringify(dashboardOverview, null, 2)}</pre>
      <h3>Quick Stats (Alias)</h3>
      <pre>{JSON.stringify(quickStats, null, 2)}</pre>
    </div>
  );
}

export default Dashboard;