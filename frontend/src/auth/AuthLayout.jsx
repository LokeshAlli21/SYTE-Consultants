import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AuthLayout({ children, authentication = true }) {
    const navigate = useNavigate();
    const location = useLocation();
    const authStatus = useSelector(state => state.auth.status);
    const userData = useSelector(state => state.auth.userData);

    // Get user role and access fields
    const userRole = userData?.role;
    const isAdmin = userRole === 'admin';
    const isUser = userRole === 'user';
    const isPromoter = userRole === 'promoter';
    const userAccessFields = userData?.access_fields || [];

    // Define who can access main app routes (non-promoter routes)
    const canAccessMainApp = isAdmin || isUser;

    // Define route to access field mapping
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

    // Function to get required access field based on current route
    const getRequiredAccess = (pathname) => {
        // Check for exact matches first
        if (routeAccessMap[pathname]) {
            return routeAccessMap[pathname];
        }

        // Check for parent routes (e.g., /projects/add should require 'projects' access)
        for (const route in routeAccessMap) {
            if (route !== '/' && pathname.startsWith(route + '/')) {
                return routeAccessMap[route];
            }
        }

        return null;
    };

    // Check access permissions for specific features
    const checkFeatureAccess = (requiredAccess) => {
        if (!requiredAccess) return true; // No specific access required
        if (isAdmin) return true; // Admin has access to everything
        return userAccessFields.includes(requiredAccess);
    };

    useEffect(() => {
        // Wait for auth status to be determined
        if (authStatus === null) {
            console.log('Auth status still loading...');
            return;
        }

        console.log('Auth check - Status:', authStatus, 'Role:', userRole, 'Path:', location.pathname);

        // Handle unauthenticated users
        if (authentication && !authStatus) {
            navigate('/login', { replace: true });
            return;
        }

        // Handle authenticated users trying to access login
        if (!authentication && authStatus) {
            // Redirect based on user role
            if (isPromoter) {
                navigate('/promoter/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
            return;
        }

        // Role-based access control for authenticated users
        if (authStatus && authentication) {
            // Promoters should only access /promoter routes
            if (isPromoter) {
                console.log(`Promoter trying to access main app route: ${location.pathname}`);
                navigate('/promoter/dashboard', { replace: true });
                return;
            }

            // Non-promoter roles trying to access main app
            if (!canAccessMainApp) {
                console.log(`Unauthorized role (${userRole}) trying to access: ${location.pathname}`);
                // If they have some other role, send them to promoter area
                // or create a role selection page
                navigate('/promoter/login', { replace: true });
                return;
            }

            // Check feature-level permissions for valid main app users
            const requiredAccess = getRequiredAccess(location.pathname);
            if (requiredAccess && !checkFeatureAccess(requiredAccess)) {
                console.log(`Access denied for route: ${location.pathname}, required: ${requiredAccess}`);
                navigate('/unauthorized', { replace: true });
                return;
            }
        }
    }, [authStatus, navigate, authentication, location.pathname, userRole, isAdmin, isUser, isPromoter, userAccessFields]);

    // Loading state
    if (authStatus === null) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
                <div className="loader"></div>
                <p className="mt-4 text-lg font-semibold text-gray-700 animate-pulse">
                    Loading, please wait...
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

    // Final access check before rendering
    if (authStatus && authentication) {
        // Double check role access
        if (isPromoter) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Redirecting...</h2>
                        <p className="text-gray-600 mb-4">
                            You are logged in as a promoter. Redirecting to your dashboard...
                        </p>
                        <button 
                            onClick={() => navigate('/promoter/dashboard')} 
                            className="bg-[#5CAAAB] text-white px-4 py-2 rounded-lg hover:bg-[#4a9899] transition-colors"
                        >
                            Go to Promoter Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        if (!canAccessMainApp) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 6.5c-.77.833-.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
                        <p className="text-gray-600 mb-4">
                            Your role ({userRole}) doesn't have access to this application.
                        </p>
                        <button 
                            onClick={() => navigate('/login')} 
                            className="bg-[#5CAAAB] text-white px-4 py-2 rounded-lg hover:bg-[#4a9899] transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            );
        }

        // Check feature access
        const requiredAccess = getRequiredAccess(location.pathname);
        if (requiredAccess && !checkFeatureAccess(requiredAccess)) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 6.5c-.77.833-.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Feature Access Denied</h2>
                        <p className="text-gray-600 mb-4">
                            You don't have permission to access this feature.
                            {requiredAccess && (
                                <span className="block text-sm mt-1">
                                    Required access: <strong>{requiredAccess}</strong>
                                </span>
                            )}
                        </p>
                        <button 
                            onClick={() => navigate('/')} 
                            className="bg-[#5CAAAB] text-white px-4 py-2 rounded-lg hover:bg-[#4a9899] transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
}

export default AuthLayout;