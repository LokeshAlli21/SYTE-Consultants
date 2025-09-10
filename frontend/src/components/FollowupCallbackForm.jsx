import React, { useState } from 'react';

const FollowupCallbackForm = ({ statusType, onSubmit, onCancel, isVisible }) => {
  const [formData, setFormData] = useState({
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
    
    if (!formData.callbackTime.trim()) {
      newErrors.callbackTime = 'Date and time is required';
    } else {
      // Validate date format (YYYY-MM-DD HH:MM)
      const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
      if (!dateRegex.test(formData.callbackTime)) {
        newErrors.callbackTime = 'Please use YYYY-MM-DD HH:MM format';
      }
    }

    if (!formData.remarks.trim()) {
      newErrors.remarks = 'Remarks are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const result = {
        callback_time: formData.callbackTime,
        remarks: formData.remarks,
        status_type: statusType
      };
      
      onSubmit(result);
      
      // Reset form
      setFormData({
        callbackTime: '',
        remarks: ''
      });
      setErrors({});
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      callbackTime: '',
      remarks: ''
    });
    setErrors({});
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {statusType} Details
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Please provide the following information for this {statusType.toLowerCase()}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="callbackTime" className="block text-sm font-medium text-gray-700 mb-1">
              {statusType} Date and Time
            </label>
            <input
              type="text"
              id="callbackTime"
              name="callbackTime"
              value={formData.callbackTime}
              onChange={handleInputChange}
              placeholder="YYYY-MM-DD HH:MM"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.callbackTime 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
            />
            {errors.callbackTime && (
              <p className="text-red-500 text-xs mt-1">{errors.callbackTime}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Format: 2024-12-25 14:30
            </p>
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder={`Enter remarks for this ${statusType.toLowerCase()}...`}
              rows="3"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.remarks 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
            />
            {errors.remarks && (
              <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Submit
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