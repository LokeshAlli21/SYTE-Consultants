import React from 'react'
import { useSelector } from 'react-redux';

function Accounts() {

        const userData = useSelector(state => state.auth.userData);
  const isAdmin = userData && userData.role === 'admin';
  const userAccessFields = userData?.access_fields || [];

  if (!isAdmin && !userAccessFields.includes('accounts')) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access Accounts.</p>
      </div>
    </div>
  );
}

  return (
    <div>Accounts</div>
  )
}

export default Accounts