import React, { useState } from 'react';
import { Calendar, Clock, MessageSquare, X, Check } from 'lucide-react';

const FollowupCallbackForm = ({ statusType = "Callback", onSubmit = () => {}, onCancel = () => {}, isVisible = true }) => {
  const [formData, setFormData] = useState({
    callbackDate: '',
    callbackTime: '',
    remarks: ''
  });
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.callbackDate.trim()) {
      newErrors.callbackDate = 'Date is required';
    } else {
      // Check if date is in the past
      const selectedDate = new Date(formData.callbackDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.callbackDate = 'Date cannot be in the past';
      }
    }

    if (!formData.callbackTime.trim()) {
      newErrors.callbackTime = 'Time is required';
    }

    if (!formData.remarks.trim()) {
      newErrors.remarks = 'Remarks are required';
    } else if (formData.remarks.trim().length < 10) {
      newErrors.remarks = 'Remarks must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const result = {
        callback_time: `${formData.callbackDate} ${formData.callbackTime}`,
        remarks: formData.remarks.trim(),
        status_type: statusType
      };
      
      onSubmit(result);
      
      // Reset form
      setFormData({
        callbackDate: '',
        callbackTime: '',
        remarks: ''
      });
      setErrors({});
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      callbackDate: '',
      callbackTime: '',
      remarks: ''
    });
    setErrors({});
    onCancel();
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];
  
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all duration-200 ease-out">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl p-6">
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Schedule {statusType}
              </h2>
              <p className="text-blue-100 text-sm">
                Set up your {statusType.toLowerCase()} details
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Input */}
            <div className="space-y-2">
              <label htmlFor="callbackDate" className="flex items-center text-sm font-medium text-gray-700">
                <Calendar size={16} className="mr-2 text-blue-600" />
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="callbackDate"
                  name="callbackDate"
                  value={formData.callbackDate}
                  onChange={handleInputChange}
                  min={today}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.callbackDate 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              </div>
              {errors.callbackDate && (
                <p className="text-red-500 text-xs flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.callbackDate}
                </p>
              )}
            </div>

            {/* Time Input */}
            <div className="space-y-2">
              <label htmlFor="callbackTime" className="flex items-center text-sm font-medium text-gray-700">
                <Clock size={16} className="mr-2 text-blue-600" />
                Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="callbackTime"
                  name="callbackTime"
                  value={formData.callbackTime}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.callbackTime 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              </div>
              {errors.callbackTime && (
                <p className="text-red-500 text-xs flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.callbackTime}
                </p>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <label htmlFor="remarks" className="flex items-center text-sm font-medium text-gray-700">
              <MessageSquare size={16} className="mr-2 text-blue-600" />
              Remarks
            </label>
            <div className="relative">
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder={`Please provide details about this ${statusType.toLowerCase()}...`}
                rows="4"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all ${
                  errors.remarks 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {formData.remarks.length}/500
              </div>
            </div>
            {errors.remarks && (
              <p className="text-red-500 text-xs flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors.remarks}
              </p>
            )}
            <p className="text-gray-500 text-xs">
              Minimum 10 characters required
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Check size={16} className="mr-2" />
              Schedule {statusType}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom hook to manage the form state and provide the Promise-based API
const useFollowupCallbackData = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentStatusType, setCurrentStatusType] = useState('');
  const [resolvePromise, setResolvePromise] = useState(null);

  const getFollowupCallbackData = (statusType) => {
    return new Promise((resolve) => {
      setCurrentStatusType(statusType);
      setIsFormVisible(true);
      setResolvePromise(() => resolve);
    });
  };

  const handleFormSubmit = (data) => {
    setIsFormVisible(false);
    if (resolvePromise) {
      resolvePromise(data);
    }
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
    if (resolvePromise) {
      resolvePromise(null);
    }
  };

  const FormComponent = () => (
    <FollowupCallbackForm
      statusType={currentStatusType}
      onSubmit={handleFormSubmit}
      onCancel={handleFormCancel}
      isVisible={isFormVisible}
    />
  );

  return {
    getFollowupCallbackData,
    FormComponent
  };
};

// Example usage:
/*
function MyComponent() {
  const { getFollowupCallbackData, FormComponent } = useFollowupCallbackData();

  const handleGetData = async (statusType) => {
    const data = await getFollowupCallbackData(statusType);
    if (data) {
      console.log('Received data:', data);
      // Process the data
    } else {
      console.log('User cancelled');
    }
  };

  return (
    <div>
      <button onClick={() => handleGetData('Follow Up')}>
        Get Follow Up Data
      </button>
      <button onClick={() => handleGetData('Call Back')}>
        Get Call Back Data
      </button>
      
      <FormComponent />
    </div>
  );
}
*/

export default FollowupCallbackForm;
export { useFollowupCallbackData };