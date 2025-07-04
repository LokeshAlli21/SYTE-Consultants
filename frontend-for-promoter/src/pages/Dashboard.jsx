import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Dashboard</h1>
        <p className="text-gray-500 mb-8">Choose where you want to go 👇</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="bg-[#5caaab] text-white py-3 rounded-xl text-lg font-medium hover:bg-[#4b999a] transition"
          >
            View Projects
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="border border-[#5caaab] text-[#5caaab] py-3 rounded-xl text-lg font-medium hover:bg-[#5caaab]/10 transition"
          >
            Go to Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
