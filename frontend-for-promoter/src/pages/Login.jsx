import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, User, Lock, ArrowRight, Building2 } from 'lucide-react';
import { login } from '../store/authSlice';
import authService from '../backend-services/auth/auth';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authStatus = useSelector(state => state.auth.status);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const response = await authService.promoterLogin(formData);
      
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
    <div className="min-h-[80vh] bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">


          {/* Login Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-8 animate-slide-up">

                    {/* Header Section */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Builder Portal
            </h1>
            <p className="text-gray-600 text-lg">Sign in to continue</p>
          </div>
          
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === 'username' ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your username"
                    className={`w-full pl-12 pr-4 py-4 bg-white/70  border-2 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                      errors.username 
                        ? 'border-red-400/50 focus:border-red-400 shadow-lg shadow-red-500/20' 
                        : focusedField === 'username'
                        ? 'border-blue-400/50 focus:border-blue-400 shadow-lg shadow-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  {/* Floating Label Effect */}
                  <div className={`absolute left-12 transition-all duration-200 pointer-events-none ${
                    formData.username || focusedField === 'username'
                      ? '-top-2 left-3 text-xs bg-white px-2 rounded text-blue-600'
                      : 'top-4 text-gray-400'
                  }`}>
                    {formData.username || focusedField === 'username' ? 'Username' : ''}
                  </div>
                </div>
                {errors.username && (
                  <p className="text-red-400 text-sm ml-2 animate-shake">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'number' : 'password'}
                    name="password"
                    inputMode="numeric"
                    pattern="\d*"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    className={`w-full pl-12 pr-12 py-4 bg-white/70  border-2 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                      errors.password 
                        ? 'border-red-400/50 focus:border-red-400 shadow-lg shadow-red-500/20' 
                        : focusedField === 'password'
                        ? 'border-blue-400/50 focus:border-blue-400 shadow-lg shadow-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      // Hide spinner arrows for number input
                      MozAppearance: 'textfield',
                      WebkitAppearance: 'none',
                      // Apply password styling when not showing password
                      WebkitTextSecurity: showPassword ? 'none' : 'disc',
                      textSecurity: showPassword ? 'none' : 'disc'
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
                    className="absolute inset-y-0 right-0 pr-4 flex items-center group"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                    )}
                  </button>
                  {/* Floating Label Effect */}
                  <div className={`absolute left-12 transition-all duration-200 pointer-events-none ${
                    formData.password || focusedField === 'password'
                      ? '-top-2 left-3 text-xs bg-white px-2 rounded text-blue-600'
                      : 'top-4 text-gray-400'
                  }`}>
                    {formData.password || focusedField === 'password' ? 'Password' : ''}
                  </div>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm ml-2 animate-shake">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 relative overflow-hidden"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badge */}
            <div className="mt-6 pt-6 border-t border-gray-200/50">
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Secure encrypted connection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx='true'>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;