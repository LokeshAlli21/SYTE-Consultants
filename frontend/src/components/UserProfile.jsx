import React, { useState } from 'react';
import { useSelector } from 'react-redux';

function UserProfile() {
    const userData = useSelector((state) => state.auth.userData);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    // Generate initials from name
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Handle image load error
    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    // Handle image load success
    const handleImageLoad = () => {
        setImageError(false);
        setImageLoading(false);
    };

    // Fallback for userData if not available
    if (!userData) {
        return (
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl shadow-lg flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-lg">U</span>
                </div>
            </div>
        );
    }

    const shouldShowImage = userData?.img_url && !imageError;
    const initials = getInitials(userData?.name);

    return (
        <div className="flex items-center gap-4">
            {/* User Info - Hidden on small screens */}
            <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {userData?.name ?? 'Unknown User'}
                </p>
                {userData?.role && (
                    <p className="text-xs text-gray-500 flex items-center justify-end gap-1.5 mt-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full shadow-sm"></span>
                        <span className="capitalize">{userData.role}</span>
                    </p>
                )}
            </div>

            {/* Profile Picture Container */}
            <div className="relative group">
                {/* Background/Placeholder */}
                <div className="w-12 h-12 bg-gradient-to-br from-[#5caaab] to-[#4a9499] rounded-xl shadow-lg ring-2 ring-white/50 hover:ring-white/70 transition-all duration-200 flex items-center justify-center overflow-hidden cursor-pointer group-hover:shadow-xl">
                    
                    {/* Loading skeleton */}
                    {shouldShowImage && imageLoading && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl"></div>
                    )}

                    {/* Profile Picture */}
                    {shouldShowImage && (
                        <img
                            src={userData.img_url}
                            alt={`${userData?.name || 'User'} Profile`}
                            className={`w-full h-full object-cover transition-opacity duration-200 ${
                                imageLoading ? 'opacity-0' : 'opacity-100'
                            }`}
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                            loading="lazy"
                        />
                    )}

                    {/* Fallback initials - Show when no image or image failed */}
                    {(!shouldShowImage || imageLoading) && (
                        <span className="text-white font-semibold text-lg select-none">
                            {initials}
                        </span>
                    )}
                </div>
                
                {/* Online Status Indicator - Uncomment if needed */}
                {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm group-hover:bg-green-500 transition-colors duration-200"></div> */}
                
                {/* Hover tooltip - Optional */}
                <div className="absolute bottom-[60%] left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {userData?.name || 'User Profile'}
                </div>
            </div>
        </div>
    );
}

export default UserProfile;