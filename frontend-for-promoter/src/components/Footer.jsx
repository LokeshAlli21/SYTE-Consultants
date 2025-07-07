import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, Shield, Heart, Mail } from 'lucide-react';
import { logout } from '../store/authSlice';
import authService from '../backend-services/auth/auth';

const Footer = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);


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
    <footer className="mt-auto">
      <div className="bg-white/70 backdrop-blur-md border-t border-white/30 px-4 py-6">
        {/* Main Footer Content */}
        <div className="max-w-6xl mx-auto">
          
          {/* Top Section - User Info & Logout */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {userData?.channelPartner?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-600">Channel Partner</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:from-red-600 hover:to-red-700 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>

          {/* Bottom Section - App Info */}
          <div className="space-y-3">

            {/* App Version & Copyright */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                <span>Made with</span>
                <Heart className="w-3 h-3 text-red-500 fill-current" />
                <span>for Channel Partner & Promoter</span>
              </div>
              <p className="text-xs text-gray-400">
                © 2025 Syte Consultants. 
              </p>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;