import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import authService from '../backend-services/auth/auth';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return; // If user cancels, stop here

    try {
      const response = await authService.logout();

      if (response) {
        dispatch(logout());
        navigate('/login');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
<div className='w-full pl-4 overflow-hidden'>
  <button
    onClick={handleLogout}
    className="group relative flex py-4 w-full items-center justify-center gap-3 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-tl-[40px] rounded-bl-[40px] hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-red-500/25 font-medium overflow-hidden"
  >
    <FiLogOut className="text-lg group-hover:rotate-12 transition-transform duration-300 z-10" />
    <span className="tracking-wide z-10">Logout</span>
    
    {/* Hover effect overlay */}
    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    {/* Shine effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
  </button>
</div>
  );
}

export default LogoutButton;
