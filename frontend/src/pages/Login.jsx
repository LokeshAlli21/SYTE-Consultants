import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import authService from '../backend-services/auth/auth';
import { login } from '../store/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Email validation
  const validateEmail = useCallback((email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateEmail]);

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
        dispatch(login(response.user));
        toast.success('🎉 Welcome back!');
        navigate('/', { replace: true });
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
      navigate('/', { replace: true });
    }
  }, [authStatus, navigate]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left Panel - Hero Section */}
        <div className="hidden lg:block bg-cover bg-center" style={{ backgroundImage: "url('../login-bg.png')" }}></div>

        {/* Right Panel - Login Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          
          {/* Mobile Logo */}
          <div className="flex items-center justify-start mb-4">
            <img className="w-20 h-20" src="../logo.png" alt="Logo" />
            <h2 className="ml-3 text-3xl font-bold text-gray-800">SYTE Consultants</h2>
          </div>
          <div className='h-1 bg-gray-200 mb-8 mx-auto w-[95%]'></div>
          {/* Header */}
          <div className="mb-8  items-center">
            <h1 className="text-2xl lg:text-3xl font-bold whitespace-nowrap text-gray-700 mb-2">
              Sign In
            </h1>
            <p className="text-gray-600 text-lg">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-xl text-gray-900 placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-[#5CAAAB] focus:border-transparent
                    transition-all duration-200 text-lg
                    ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
                  `}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  {errors.email}
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
                  inputMode="decimal" 
                  type={showPassword ? 'text' : 'number'}
                  pattern="[0-9]*"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`
                    block w-full pl-10 pr-12 py-3 border rounded-xl text-gray-900 placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-[#5CAAAB] focus:border-transparent
                    transition-all duration-200 text-lg
                    ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
                  `}
                  placeholder="Enter your password"
                  style={{
                    // Apply password masking unless showing password
                    WebkitTextSecurity: showPassword ? 'none' : 'disc',
                    textSecurity: showPassword ? 'none' : 'disc',
                    fontFamily: showPassword ? 'inherit' : 'monospace',
                    // Hide number input spinners
                    MozAppearance: 'textfield',
                  }}
                />
                <style jsx>{`
                input[type="number"]::-webkit-outer-spin-button,
                input[type="number"]::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
              `}</style>
                
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

            {/* Forgot Password */}
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#5CAAAB] focus:ring-[#5CAAAB] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-[#5CAAAB] hover:text-[#076666] font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div> */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl
                text-white font-semibold text-lg transition-all duration-200
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
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          {/* <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button className="font-medium text-[#5CAAAB] hover:text-[#076666] transition-colors">
                Contact Administrator
              </button>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;