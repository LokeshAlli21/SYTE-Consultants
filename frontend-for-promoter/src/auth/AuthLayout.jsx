import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AuthLayout({ children, authentication = true }) {
    const navigate = useNavigate();
    const location = useLocation();
    const authStatus = useSelector(state => state.auth.status);
    const userData = useSelector(state => state.auth.userData);

    const userRole = userData?.role;

    useEffect(() => {
        // Wait for auth to load
        if (authStatus === null) {
            return;
        }

        // Handle unauthenticated users
        if (authentication && !authStatus) {
            navigate('/login', { replace: true });
            return;
        }

        // Handle promoter login page access
        if (!authentication && authStatus) {
                navigate('/', { replace: true });
            return;
        }
    }, [authStatus, authentication]);

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