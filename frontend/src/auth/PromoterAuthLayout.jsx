import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PromoterAuthLayout({ children, authentication = true }) {
    const navigate = useNavigate();
    const location = useLocation();
    const authStatus = useSelector(state => state.auth.status);
    const userData = useSelector(state => state.auth.userData);

    // Get user role
    const userRole = userData?.role;
    const isPromoter = userRole === 'promoter';
    const isAdmin = userRole === 'admin';
    const isUser = userRole === 'user';

    useEffect(() => {
        // Wait for auth status to be determined
        if (authStatus === null) {
            console.log('Auth status still loading...');
            return;
        }

        console.log('Promoter Auth check - Status:', authStatus, 'Role:', userRole, 'Path:', location.pathname);

        // Handle unauthenticated users
        if (authentication && !authStatus) {
            navigate('/promoter/login', { replace: true });
            return;
        }

        // Handle authenticated users trying to access promoter login
        if (!authentication && authStatus) {
            if (isPromoter) {
                navigate('/promoter/dashboard', { replace: true });
            } else {
                // Non-promoters trying to access promoter login should go to main app
                navigate('/login', { replace: true });
            }
            return;
        }

        // Role-based access control for authenticated users
        if (authStatus && authentication) {
            // Only promoters can access promoter routes
            if (!isPromoter) {
                console.log(`Non-promoter (${userRole}) trying to access promoter route: ${location.pathname}`);
                
                // Redirect based on their actual role
                if (isAdmin || isUser) {
                    navigate('/', { replace: true }); // Main app dashboard
                } else {
                    navigate('/login', { replace: true }); // Unknown role, back to login
                }
                return;
            }
        }
    }, [authStatus, navigate, authentication, location.pathname, userRole, isPromoter, isAdmin, isUser]);

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
        if (!isPromoter) {
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
                            This area is restricted to promoters only.
                            <span className="block text-sm mt-1">
                                Your current role: <strong>{userRole || 'Unknown'}</strong>
                            </span>
                        </p>
                        <div className="space-y-2">
                            {(isAdmin || isUser) && (
                                <button 
                                    onClick={() => navigate('/')} 
                                    className="w-full bg-[#5CAAAB] text-white px-4 py-2 rounded-lg hover:bg-[#4a9899] transition-colors"
                                >
                                    Go to Main Dashboard
                                </button>
                            )}
                            <button 
                                onClick={() => navigate('/promoter/login')} 
                                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Promoter Login
                            </button>
                            <button 
                                onClick={() => navigate('/login')} 
                                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Main App Login
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
}

export default PromoterAuthLayout;