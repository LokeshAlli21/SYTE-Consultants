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
        className="flex py-4 w-full items-center justify-center gap-2 p-2 bg-red-500 text-white rounded-tl-[40px] rounded-bl-[40px] hover:bg-red-700 transition duration-300"
      >
        <FiLogOut className="text-xl" />
        Logout
      </button>
    </div>
  );
}

export default LogoutButton;
