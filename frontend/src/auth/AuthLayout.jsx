import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AuthLayout({ children, authentication = true }) {
    const navigate = useNavigate();
    const authStatus = useSelector(state => state.auth.status);

    useEffect(() => {
        if (authStatus === null) {
            console.log('Auth status still loading...');
            return;
        }

        console.log('Final auth status:', authStatus);

        if (authentication && !authStatus) {
            // user must be logged in, but they are not
            navigate('/login', { replace: true });
        }

        if (!authentication && authStatus) {
            // user is logged in, but trying to access login/register
            navigate('/', { replace: true });
        }
    }, [authStatus, navigate, authentication]);

    if (authStatus === null) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
                {/* Spinner */}
                <div className="loader"></div>

                {/* Optional Loading Text */}
                <p className="mt-4 text-lg font-semibold text-gray-700 animate-pulse">
                    Loading, please wait...
                </p>

                {/* CSS for the loading animation */}
                <style>{`
                    .loader {
                    border: 6px solid #f3f3f3; /* Light grey background */
                    border-top: 6px solid #5CAAAB; /* Your brand color */
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

    return <>{children}</>;
}

export default AuthLayout;
