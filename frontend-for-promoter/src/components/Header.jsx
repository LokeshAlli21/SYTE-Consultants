
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';

const Header = () => {

const userData = useSelector((state) => state.auth.userData);

const navigate = useNavigate();

  const [isContactOpen, setIsContactOpen] = useState(false);

  const toggleContact = () => {
    setIsContactOpen(!isContactOpen);
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className=" px-2 py-3 ">
      {/* Main Header */}
      <div 
        className={`flex items-center gap-4 ${isContactOpen ? 'mb-4' : ''} cursor-pointer transition-all duration-300 hover:bg-white/30 rounded-2xl p-2 -m-2`}
        onClick={toggleContact}
      >
        {/* Logo/Profile Image */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 flex items-center justify-center relative">
          {userData?.channelPartner?.cp_photo_uploaded_url ? (
            <img 
              src={userData.channelPartner.cp_photo_uploaded_url} 
              alt="Channel Partner"
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src="/logo.png" 
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
          )}
        </div>
        
        {/* Header Content */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
            {userData?.channelPartner?.full_name ? userData.channelPartner.full_name : 'My Projects'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Monitor Every Detail of Your Projects
          </p>
        </div>
      </div>
          
        {/* Back Button */}
        <div className="absolute top-19 left-5 w-fit h-fit bg-transparent z-50 rounded-full flex items-center justify-center" onClick={goBack}>
          <ArrowLeft className="w-12 h-12 text-gray-500" />
        </div>

                {/* Click indicator */}
          {userData?.channelPartner && (
            <div className="absolute top-12 right-2 w-6 h-6 bg-transparent rounded-full flex items-center justify-center">
              <svg 
                className={`w-3 h-3 text-gray-500 transition-transform duration-300 ${isContactOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}

      {/* Contact Information Card - Smooth Transition */}
      {userData?.channelPartner && (
        <div className={`
          transition-all duration-500 ease-in-out overflow-hidden mx-2
          ${isContactOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 mb-0'}
        `}>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/30 relative overflow-hidden transform transition-all duration-500 ease-in-out">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl"></div>
            
            {/* Content */}
            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Information</p>
                  <h2 className="text-lg font-bold text-gray-900">
                    Get in Touch
                  </h2>
                </div>
              </div>
              
              {/* Contact Info - Compact Layout with staggered animation */}
              <div className="space-y-2">
                <div className={`
                  flex items-center gap-2 text-sm transition-all duration-300 delay-100
                  ${isContactOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                `}>
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-900 truncate">{userData.channelPartner.email_id}</span>
                </div>
                
                <div className={`
                  flex items-center gap-2 text-sm transition-all duration-300 delay-200
                  ${isContactOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                `}>
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-900">{userData.channelPartner.contact_number}</span>
                </div>
                
                <div className={`
                  flex items-center gap-2 text-sm transition-all duration-300 delay-300
                  ${isContactOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                `}>
                  <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-900">{userData.channelPartner.city}, {userData.channelPartner.district}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;