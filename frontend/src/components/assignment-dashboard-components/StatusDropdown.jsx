import { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

// Status configuration with color schemes and available options by type
const statusOptionsByType = {
  registration: [
    { value: "new", label: "New" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "info-pending-cp", label: "Info Pending - CP" },
    { value: "govt-fees-pending", label: "Govt Fees Pending" },
    { value: "application-done", label: "Application Done" },
    { value: "scrutiny-raised-d1", label: "Scrutiny Raised - D1" },
    { value: "app-pending-d1", label: "App Pending - D1" },
    { value: "scrutiny-raised-d2", label: "Scrutiny Raised - D2" },
    { value: "app-pending-d2", label: "App Pending - D2" },
    { value: "scrutiny-raised-d3", label: "Scrutiny Raised - D3" },
    { value: "app-pending-d3", label: "App Pending - D3" },
    { value: "scrutiny-raised-d4", label: "Scrutiny Raised - D4" },
    { value: "app-pending-d4", label: "App Pending - D4" },
    { value: "certificate-generated", label: "Certificate Generated" },
    { value: "close", label: "Close" }
  ],
  extension: [
    { value: "new", label: "New" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "info-pending-cp", label: "Info Pending - CP" },
    { value: "govt-fees-pending", label: "Govt Fees Pending" },
    { value: "application-done", label: "Application Done" },
    { value: "scrutiny-raised-d1", label: "Scrutiny Raised - D1" },
    { value: "app-pending-d1", label: "App Pending - D1" },
    { value: "scrutiny-raised-d2", label: "Scrutiny Raised - D2" },
    { value: "app-pending-d2", label: "App Pending - D2" },
    { value: "scrutiny-raised-d3", label: "Scrutiny Raised - D3" },
    { value: "app-pending-d3", label: "App Pending - D3" },
    { value: "scrutiny-raised-d4", label: "Scrutiny Raised - D4" },
    { value: "app-pending-d4", label: "App Pending - D4" },
    { value: "certificate-generated", label: "Certificate Generated" },
    { value: "close", label: "Close" }
  ],
  correction: [
    { value: "new", label: "New" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "info-pending-cp", label: "Info Pending - CP" },
    { value: "govt-fees-pending", label: "Govt Fees Pending" },
    { value: "application-done", label: "Application Done" },
    { value: "scrutiny-raised-d1", label: "Scrutiny Raised - D1" },
    { value: "app-pending-d1", label: "App Pending - D1" },
    { value: "scrutiny-raised-d2", label: "Scrutiny Raised - D2" },
    { value: "app-pending-d2", label: "App Pending - D2" },
    { value: "scrutiny-raised-d3", label: "Scrutiny Raised - D3" },
    { value: "app-pending-d3", label: "App Pending - D3" },
    { value: "scrutiny-raised-d4", label: "Scrutiny Raised - D4" },
    { value: "app-pending-d4", label: "App Pending - D4" },
    { value: "certificate-generated", label: "Certificate Generated" },
    { value: "close", label: "Close" }
  ],
  change: [
    { value: "new", label: "New" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "application-done", label: "Application Done" },
    { value: "close", label: "Close" }
  ],
  deregister: [
    { value: "new", label: "New" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "info-pending-cp", label: "Info Pending - CP" },
    { value: "govt-fees-pending", label: "Govt Fees Pending" },
    { value: "application-done", label: "Application Done" },
    { value: "scrutiny-raised", label: "Scrutiny Raised" },
    { value: "app-pending", label: "App Pending" },
    { value: "work-done", label: "Work Done" },
    { value: "close", label: "Close" }
  ],
  abeyance: [
    { value: "new", label: "New" },
    { value: "qpr-submitted", label: "QPR Submitted" },
    { value: "form-5-submitted", label: "Form 5 Submitted" },
    { value: "form-2a-submitted", label: "Form 2A Submitted" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "info-pending-cp", label: "Info Pending - CP" },
    { value: "govt-fees-pending", label: "Govt Fees Pending" },
    { value: "application-done", label: "Application Done" },
    { value: "scrutiny-raised", label: "Scrutiny Raised" },
    { value: "app-pending", label: "App Pending" },
    { value: "work-done", label: "Work Done" },
    { value: "close", label: "Close" }
  ],
  lapsed: [
    { value: "new", label: "New" },
    { value: "qpr-submitted", label: "QPR Submitted" },
    { value: "form-5-submitted", label: "Form 5 Submitted" },
    { value: "form-2a-submitted", label: "Form 2A Submitted" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "info-pending-cp", label: "Info Pending - CP" },
    { value: "govt-fees-pending", label: "Govt Fees Pending" },
    { value: "application-done", label: "Application Done" },
    { value: "scrutiny-raised", label: "Scrutiny Raised" },
    { value: "app-pending", label: "App Pending" },
    { value: "work-done", label: "Work Done" },
    { value: "close", label: "Close" }
  ],
  closure: [
    { value: "new", label: "New" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "info-pending-cp", label: "Info Pending - CP" },
    { value: "application-done", label: "Application Done" },
    { value: "scrutiny-raised", label: "Scrutiny Raised" },
    { value: "app-pending", label: "App Pending" },
    { value: "work-done", label: "Work Done" },
    { value: "close", label: "Close" }
  ],
  general_update: [
    { value: "new", label: "New" },
    { value: "qpr-submitted", label: "QPR Submitted" },
    { value: "form-5-submitted", label: "Form 5 Submitted" },
    { value: "form-2a-submitted", label: "Form 2A Submitted" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "info-pending-cp", label: "Info Pending - CP" },
    { value: "govt-fees-pending", label: "Govt Fees Pending" },
    { value: "application-done", label: "Application Done" },
    { value: "work-done", label: "Work Done" },
    { value: "close", label: "Close" }
  ],
  qpr_notice: [
    { value: "new", label: "New" },
    { value: "qpr-submitted", label: "QPR Submitted" },
    { value: "form-5-submitted", label: "Form 5 Submitted" },
    { value: "form-2a-submitted", label: "Form 2A Submitted" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "info-pending-cp", label: "Info Pending - CP" },
    { value: "reply-to-notice-sent", label: "Reply to Notice Sent" },
    { value: "application-done", label: "Application Done" },
    { value: "work-done", label: "Work Done" },
    { value: "close", label: "Close" }
  ],
  advertisement_notice: [
    { value: "new", label: "New" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "info-pending-cp", label: "Info Pending - CP" },
    { value: "reply-to-notice-sent", label: "Reply to Notice Sent" },
    { value: "application-done", label: "Application Done" },
    { value: "work-done", label: "Work Done" },
    { value: "close", label: "Close" }
  ],
  other_notice: [
    { value: "new", label: "New" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "info-pending-cp", label: "Info Pending - CP" },
    { value: "reply-to-notice-sent", label: "Reply to Notice Sent" },
    { value: "application-done", label: "Application Done" },
    { value: "work-done", label: "Work Done" },
    { value: "close", label: "Close" }
  ],
  login_id_retrieval: [
    { value: "new", label: "New" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "info-pending-cp", label: "Info Pending - CP" },
    { value: "email-sent-to-authority", label: "Email sent to authority" },
    { value: "application-done", label: "Application Done" },
    { value: "work-done", label: "Work Done" },
    { value: "close", label: "Close" }
  ],
  // Default options for any other assignment type
  default: [
    { value: "new", label: "New" },
    { value: "info-pending-syte", label: "Info Pending - SYTE" },
    { value: "info-pending-client", label: "Info Pending - Client" },
    { value: "close", label: "Close" }
  ]
};

const statusColorMap = {
  new: "bg-blue-100 text-blue-800 border-blue-300",
  "info-pending-syte": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "info-pending-client": "bg-yellow-200 text-yellow-900 border-yellow-400",
  "info-pending-cp": "bg-yellow-300 text-yellow-900 border-yellow-500",
  "govt-fees-pending": "bg-orange-100 text-orange-800 border-orange-300",
  "application-done": "bg-green-100 text-green-800 border-green-300",
  "scrutiny-raised": "bg-red-100 text-red-800 border-red-300",
  "scrutiny-raised-d1": "bg-red-100 text-red-800 border-red-300",
  "app-pending-d1": "bg-red-200 text-red-900 border-red-400",
  "scrutiny-raised-d2": "bg-red-200 text-red-900 border-red-400",
  "app-pending-d2": "bg-red-300 text-red-900 border-red-500",
  "scrutiny-raised-d3": "bg-red-300 text-red-900 border-red-500",
  "app-pending-d3": "bg-red-400 text-red-900 border-red-600",
  "scrutiny-raised-d4": "bg-red-400 text-red-900 border-red-600",
  "app-pending-d4": "bg-red-500 text-red-900 border-red-700",
  "certificate-generated": "bg-green-200 text-green-900 border-green-400",
  close: "bg-gray-300 text-gray-800 border-gray-400",
  "qpr-submitted": "bg-purple-100 text-purple-800 border-purple-300",
  "form-5-submitted": "bg-purple-200 text-purple-900 border-purple-400",
  "form-2a-submitted": "bg-purple-300 text-purple-900 border-purple-500",
  "app-pending": "bg-red-300 text-red-900 border-red-500",
  "work-done": "bg-green-300 text-green-900 border-green-500",
  "reply-to-notice-sent": "bg-pink-100 text-pink-800 border-pink-300",
  "email-sent-to-authority": "bg-blue-200 text-blue-900 border-blue-400",
  default: "bg-white text-gray-800 border-gray-300"
};

export default function StatusDropdown({ 
  currentStatus = "", 
  assignmentType = "", 
  onChange,
  disabled = false,
  customClasses = "",
  showIcon = true,
  placeholder = "Select Status",
  maxHeight = "max-h-60"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableOptions, setAvailableOptions] = useState([]);
  
  // Normalize inputs
  const normalizedType = assignmentType.trim().toLowerCase();
  const normalizedStatus = currentStatus?.toLowerCase() || "";
  
  // Get appropriate status color class
  const statusColorClass = statusColorMap[normalizedStatus] || statusColorMap.default;

  // Update available options when assignment type changes
  useEffect(() => {
    const options = statusOptionsByType[normalizedType] || 
                    statusOptionsByType.default;
    setAvailableOptions(options);
  }, [normalizedType]);
  
  // Find the currently selected option for display
  const selectedOption = availableOptions.find(opt => 
    opt.value.toLowerCase() === normalizedStatus
  );
  
  return (
    <div className=" inline-block w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between min-w-[10px] px-3 py-2 text-sm border rounded-md ${statusColorClass} ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-80'} ${customClasses}`}
      >
        <span className="font-medium truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {!disabled && <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />}
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute z-20 w-[200px] mt-1 bg-white border rounded-md shadow-lg">
          <ul className={`py-1 overflow-auto ${maxHeight}`}>
            {availableOptions.map(option => (
              <li
                key={option.value}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                  option.value.toLowerCase() === normalizedStatus ? 'bg-gray-50' : ''
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span>{option.label}</span>
                {option.value.toLowerCase() === normalizedStatus && showIcon && (
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
