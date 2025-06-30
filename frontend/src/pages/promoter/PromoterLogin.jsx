import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, User, Lock, Loader2, Building2 } from 'lucide-react';
import authService from '../../backend-services/auth/auth';
import { login } from '../../store/authSlice';

const PromoterLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else 

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const response = await authService.login(formData);
      
      if (response?.user) {
        // Check if user is a promoter
        if (response.user.role !== 'promoter') {
          toast.error('🚫 Access denied. This login is for promoters only.');
          return;
        }
        
        dispatch(login(response.user));
        toast.success('🎉 Welcome to Promoter Portal!');
        navigate('/promoter/dashboard', { replace: true });
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(`🚫 ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (authStatus === true) {
      navigate('/promoter/dashboard', { replace: true });
    }
  }, [authStatus, navigate]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#076666] to-[#5CAAAB] px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Promoter Portal
            </h1>
            <p className="text-white/90 text-sm">
              Sign in to access your projects and dashboard
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6">
            
            {/* Brand Info */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <img className="w-12 h-12" src="../logo.png" alt="Logo" />
                <span className="ml-2 text-lg font-semibold text-gray-800">SYTE</span>
              </div>
              <div className="h-0.5 bg-gray-200 w-16 mx-auto"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`
                      block w-full pl-10 pr-3 py-3 border rounded-xl text-gray-900 placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-[#5CAAAB] focus:border-transparent
                      transition-all duration-200
                      ${errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
                    `}
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`
                      block w-full pl-10 pr-12 py-3 border rounded-xl text-gray-900 placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-[#5CAAAB] focus:border-transparent
                      transition-all duration-200
                      ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
                    `}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl
                  text-white font-semibold transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5CAAAB]
                  ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#076666] to-[#5CAAAB] hover:from-[#065555] hover:to-[#4a9999] active:scale-98 shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Signing In...
                  </>
                ) : (
                  'Sign In to Portal'
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-[#5CAAAB] hover:text-[#4a9999] transition-colors"
              >
                ← Back to Main Login
              </button>
            </div>

            {/* Mobile Optimized Footer */}
            <div className="mt-8 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Promoter Portal • SYTE Consultants
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Helper Text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            For the best experience, add this page to your home screen
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromoterLogin;