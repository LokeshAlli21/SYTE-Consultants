import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AuthLayout({ children, authentication = true }) {
    const navigate = useNavigate();
    const location = useLocation();
    const authStatus = useSelector(state => state.auth.status);
    const userData = useSelector(state => state.auth.userData);

    const userRole = userData?.role;
    const isAdmin = userRole === 'admin';
    const isUser = userRole === 'user';
    const isPromoter = userRole === 'promoter';
    const userAccessFields = userData?.access_fields || [];

    // Only admin and user can access main app
    const canAccessMainApp = isAdmin || isUser;

    // Route to access field mapping
    const routeAccessMap = {
        '/': 'dashboard',
        '/dashboard': 'dashboard',
        '/promoters': 'promoters',
        '/projects': 'projects',
        '/assignments': 'assignments',
        '/channel-partners': 'channel partners',
        '/qpr': 'qpr',
        '/aa': 'aa',
        '/reports': 'reports',
        '/accounts': 'accounts'
    };

    const getRequiredAccess = (pathname) => {
        if (routeAccessMap[pathname]) {
            return routeAccessMap[pathname];
        }

        for (const route in routeAccessMap) {
            if (route !== '/' && pathname.startsWith(route + '/')) {
                return routeAccessMap[route];
            }
        }
        return null;
    };

    const checkFeatureAccess = (requiredAccess) => {
        if (!requiredAccess) return true;
        if (isAdmin) return true;
        return userAccessFields.includes(requiredAccess);
    };

    useEffect(() => {
        // ⭐ CRITICAL: Only run auth logic if we're still loading or handling auth routes
        if (authStatus === null) {
            return; // Still loading
        }

        // Handle unauthenticated users
        if (authentication && !authStatus) {
            navigate('/login', { replace: true });
            return;
        }

        // Handle login page access
        if (!authentication && authStatus) {
            // User is logged in but accessing login page
            if (isPromoter) {
                // Promoters should go to their area
                navigate('/promoter/dashboard', { replace: true });
            } else if (canAccessMainApp) {
                // Admin/Users go to main dashboard
                navigate('/', { replace: true });
            }
            return;
        }

        // ⭐ MAIN APP PROTECTION: Only for authenticated routes
        if (authStatus && authentication) {
            // Promoters trying to access main app routes
            if (isPromoter) {
                navigate('/promoter/dashboard', { replace: true });
                return;
            }

            // Non-main-app users
            if (!canAccessMainApp) {
                navigate('/login', { replace: true });
                return;
            }

            // Feature-level access check for valid users
            const requiredAccess = getRequiredAccess(location.pathname);
            if (requiredAccess && !checkFeatureAccess(requiredAccess)) {
                navigate('/unauthorized', { replace: true });
                return;
            }
        }
    }, [authStatus, authentication, isPromoter, canAccessMainApp, location.pathname]);

    // Loading state
    if (authStatus === null) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
                <div className="loader"></div>
                <p className="mt-4 text-lg font-semibold text-gray-700 animate-pulse">
                    Loading...
                </p>
                <style>{`
                    .loader {
                        border: 6px solid #f3f3f3;
                        border-top: 6px solid #5CAAAB;
                        border-radius: 50%;
                        width: 60px;
                        height: 60px;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // ⭐ RENDER CHILDREN IMMEDIATELY - No additional blocking checks
    return <>{children}</>;
}

export default AuthLayout;