import React, { useEffect, useState } from 'react';
import databaseService from '../backend-services/database/database'; // Adjust the path as needed
import { toast } from 'react-toastify'; // Assuming you have react-toastify for notifications

function Dashboard() {
  const [masterDashboardData, setMasterDashboardData] = useState(null);
  const [promotersDashboardData, setPromotersDashboardData] = useState(null);
  const [projectsDashboardData, setProjectsDashboardData] = useState(null);
  const [unitsDashboardData, setUnitsDashboardData] = useState(null);
  const [assignmentsDashboardData, setAssignmentsDashboardData] = useState(null);
  const [financialDashboardData, setFinancialDashboardData] = useState(null);
  const [siteProgressDashboardData, setSiteProgressDashboardData] = useState(null);
  const [channelPartnersDashboardData, setChannelPartnersDashboardData] = useState(null);
  const [remindersDashboardData, setRemindersDashboardData] = useState(null);
  const [documentStatusDashboardData, setDocumentStatusDashboardData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAllDashboardData() {
      try {
        // Fetch Master Dashboard
        const masterData = await databaseService.getMasterDashboard();
        setMasterDashboardData(masterData);

        // Fetch Promoters Dashboard (with default params)
        const promotersData = await databaseService.getPromotersDashboard({ page: 1, limit: 5 });
        setPromotersDashboardData(promotersData);

        // Fetch Projects Dashboard (with default params)
        const projectsData = await databaseService.getProjectsDashboard({ page: 1, limit: 5 });
        setProjectsDashboardData(projectsData);

        // Fetch Units Dashboard (with default params)
        const unitsData = await databaseService.getUnitsDashboard({ page: 1, limit: 5 });
        setUnitsDashboardData(unitsData);

        // Fetch Assignments Dashboard (with default params)
        const assignmentsData = await databaseService.getAssignmentsDashboard({ page: 1, limit: 5 });
        setAssignmentsDashboardData(assignmentsData);

        // Fetch Financial Dashboard
        const financialData = await databaseService.getFinancialDashboard();
        setFinancialDashboardData(financialData);

        // Fetch Site Progress Dashboard (with default params)
        const siteProgressData = await databaseService.getSiteProgressDashboard({ page: 1, limit: 5 });
        setSiteProgressDashboardData(siteProgressData);

        // Fetch Channel Partners Dashboard (with default params)
        const channelPartnersData = await databaseService.getChannelPartnersDashboard({ page: 1, limit: 5 });
        setChannelPartnersDashboardData(channelPartnersData);

        // Fetch Reminders Dashboard (with default params)
        const remindersData = await databaseService.getRemindersDashboard({ page: 1, limit: 5 });
        setRemindersDashboardData(remindersData);

        // Fetch Document Status Dashboard (with default params)
        const documentStatusData = await databaseService.getDocumentStatusDashboard({ page: 1, limit: 5 });
        setDocumentStatusDashboardData(documentStatusData);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    fetchAllDashboardData();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard data...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Dashboard Overview</h1>
      <p>This dashboard displays data fetched from various backend services. The focus here is on data fetching and display, not elaborate UI.</p>

      {/* --- Master Dashboard --- */}
      <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
        <h2>Master Dashboard Overview</h2>
        {masterDashboardData ? (
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
            {JSON.stringify(masterDashboardData, null, 2)}
          </pre>
        ) : (
          <p>No master dashboard data available.</p>
        )}
      </div>

      {/* --- Promoters Dashboard --- */}
      <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
        <h2>Promoters Dashboard (First 5)</h2>
        {promotersDashboardData && promotersDashboardData.data && promotersDashboardData.data.length > 0 ? (
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
            {JSON.stringify(promotersDashboardData.data, null, 2)}
          </pre>
        ) : (
          <p>No promoters data available or fetching failed.</p>
        )}
        {promotersDashboardData && promotersDashboardData.pagination && (
          <p>Total Promoters: {promotersDashboardData.pagination.totalRecords}</p>
        )}
      </div>

      {/* --- Projects Dashboard --- */}
      <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
        <h2>Projects Dashboard (First 5)</h2>
        {projectsDashboardData && projectsDashboardData.data && projectsDashboardData.data.length > 0 ? (
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
            {JSON.stringify(projectsDashboardData.data, null, 2)}
          </pre>
        ) : (
          <p>No projects data available or fetching failed.</p>
        )}
        {projectsDashboardData && projectsDashboardData.pagination && (
          <p>Total Projects: {projectsDashboardData.pagination.totalRecords}</p>
        )}
      </div>

      {/* --- Units Dashboard --- */}
      <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
        <h2>Units Dashboard (First 5)</h2>
        {unitsDashboardData && unitsDashboardData.data && unitsDashboardData.data.length > 0 ? (
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
            {JSON.stringify(unitsDashboardData.data, null, 2)}
          </pre>
        ) : (
          <p>No units data available or fetching failed.</p>
        )}
        {unitsDashboardData && unitsDashboardData.pagination && (
          <p>Total Units: {unitsDashboardData.pagination.totalRecords}</p>
        )}
      </div>

      {/* --- Assignments Dashboard --- */}
      <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
        <h2>Assignments Dashboard (First 5)</h2>
        {assignmentsDashboardData && assignmentsDashboardData.data && assignmentsDashboardData.data.length > 0 ? (
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
            {JSON.stringify(assignmentsDashboardData.data, null, 2)}
          </pre>
        ) : (
          <p>No assignments data available or fetching failed.</p>
        )}
        {assignmentsDashboardData && assignmentsDashboardData.pagination && (
          <p>Total Assignments: {assignmentsDashboardData.pagination.totalRecords}</p>
        )}
      </div>

      {/* --- Financial Dashboard --- */}
      <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
        <h2>Financial Dashboard</h2>
        {financialDashboardData ? (
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
            {JSON.stringify(financialDashboardData, null, 2)}
          </pre>
        ) : (
          <p>No financial dashboard data available.</p>
        )}
      </div>

      {/* --- Site Progress Dashboard --- */}
      <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
        <h2>Site Progress Dashboard (First 5)</h2>
        {siteProgressDashboardData && siteProgressDashboardData.data && siteProgressDashboardData.data.length > 0 ? (
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
            {JSON.stringify(siteProgressDashboardData.data, null, 2)}
          </pre>
        ) : (
          <p>No site progress data available or fetching failed.</p>
        )}
        {siteProgressDashboardData && siteProgressDashboardData.pagination && (
          <p>Total Site Progress Entries: {siteProgressDashboardData.pagination.totalRecords}</p>
        )}
      </div>

      {/* --- Channel Partners Dashboard --- */}
      <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
        <h2>Channel Partners Dashboard (First 5)</h2>
        {channelPartnersDashboardData && channelPartnersDashboardData.data && channelPartnersDashboardData.data.length > 0 ? (
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
            {JSON.stringify(channelPartnersDashboardData.data, null, 2)}
          </pre>
        ) : (
          <p>No channel partners data available or fetching failed.</p>
        )}
        {channelPartnersDashboardData && channelPartnersDashboardData.pagination && (
          <p>Total Channel Partners: {channelPartnersDashboardData.pagination.totalRecords}</p>
        )}
      </div>

      {/* --- Reminders Dashboard --- */}
      <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
        <h2>Reminders Dashboard (First 5)</h2>
        {remindersDashboardData && remindersDashboardData.data && remindersDashboardData.data.length > 0 ? (
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
            {JSON.stringify(remindersDashboardData.data, null, 2)}
          </pre>
        ) : (
          <p>No reminders data available or fetching failed.</p>
        )}
        {remindersDashboardData && remindersDashboardData.pagination && (
          <p>Total Reminders: {remindersDashboardData.pagination.totalRecords}</p>
        )}
      </div>

      {/* --- Document Status Dashboard --- */}
      <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
        <h2>Document Status Dashboard (First 5)</h2>
        {documentStatusDashboardData && documentStatusDashboardData.data && documentStatusDashboardData.data.length > 0 ? (
          <pre style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
            {JSON.stringify(documentStatusDashboardData.data, null, 2)}
          </pre>
        ) : (
          <p>No document status data available or fetching failed.</p>
        )}
        {documentStatusDashboardData && documentStatusDashboardData.pagination && (
          <p>Total Document Status Entries: {documentStatusDashboardData.pagination.totalRecords}</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;