import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify'; // Import Toast for notifications
import authService from '../backend-services/auth/auth';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/authSlice';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state to check if user is already logged in
  const authStatus = useSelector((state) => state.auth.status);

  const [redirectAfterLogin, setRedirectAfterLogin] = useState(false);

  // State to hold email, password, error messages, and loading state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to handle email validation
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  // Function to handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate email
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate password
    if (password.trim() === '') {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // If validation passes, proceed to login
    if (isValid) {
      setLoading(true); // Start loading animation
      try {
        // Call the login method from authService
        const response = await authService.login({ email, password });

        // Handle successful login
        if (response) {
          // Dispatch the login action to update the store
          dispatch(login(response.user));
          setRedirectAfterLogin(true); // Set a flag after dispatch
        }
      } catch (error) {
        // Handle error during login
        toast.error('🚫 Invalid credentials. Please try again.');
      } finally {
        setLoading(false); // Stop loading animation
      }
    }
  };

  // Check if user is logged in and redirect to home
  useEffect(() => {
    if (authStatus === true) {
      console.log('navigating to /');
      
      navigate('/'); // Redirect if user is already logged in
    }
  }, [authStatus, navigate]);

  // New useEffect to redirect after login success
  useEffect(() => {
    if (redirectAfterLogin && authStatus === true) {
      console.log('navigating to /');
        navigate('/');
    }
  }, [redirectAfterLogin, authStatus, navigate]);

  return (
    <div className='w-full h-screen flex items-center justify-center bg-gray-100 relative'>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="loader"></div>
        </div>
      )}

      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Left side with background image */}
        <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('../login-bg.png')" }}></div>

        {/* Right side with form */}
        <div className="w-1/2 p-8 flex flex-col justify-center items-center bg-white">
          <div className="flex items-center justify-start w-full font-semibold text-[32px] leading-[100%]">
            <img className="w-[100px]" src="../logo.png" alt="Logo" />
            <h2 className="ml-4">SYTE Consultants</h2>
          </div>

          <h2 className="font-semibold text-[32px] mt-8">Welcome back!</h2>
          <p className="font-medium text-lg text-gray-600">Login to continue</p>

          <form onSubmit={handleLogin} className="w-full mt-6">
            {/* Email Input */}
            <div className="w-full mb-4">
              <input
                type="email"
                placeholder="Email"
                className={`w-full px-4 py-2 border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-[#5CAAAB] ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
            </div>

            {/* Password Input */}
            <div className="w-full mb-6">
              <input
                type="password"
                placeholder="Password"
                className={`w-full px-4 py-2 border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-[#5CAAAB] ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
            </div>

            {/* Forgot Password Link */}
            {/* <div className="w-full text-left text-sm mb-4">
              <p className="text-gray-600">
                Forgot your password?{' '}
                <span className="text-[#5CAAAB] cursor-pointer hover:underline">
                  Request
                </span>
              </p>
            </div> */}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-b from-[#076666] to-[#5CAAAB] text-white py-3 rounded-lg font-semibold hover:bg-gradient-to-t transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>

      {/* CSS for the loading animation */}
      <style>{`
        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #5CAAAB;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Login;
