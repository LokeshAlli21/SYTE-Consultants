import { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { toast } from 'react-toastify';

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
  new: {
    background: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    hover: "hover:bg-blue-100"
  },
  "info-pending-syte": {
    background: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    hover: "hover:bg-amber-100"
  },
  "info-pending-client": {
    background: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
    hover: "hover:bg-yellow-100"
  },
  "info-pending-cp": {
    background: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    hover: "hover:bg-orange-100"
  },
  "govt-fees-pending": {
    background: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    hover: "hover:bg-orange-100"
  },
  "application-done": {
    background: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    hover: "hover:bg-green-100"
  },
  "scrutiny-raised": {
    background: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    hover: "hover:bg-red-100"
  },
  "scrutiny-raised-d1": {
    background: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    hover: "hover:bg-red-100"
  },
  "app-pending-d1": {
    background: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-200"
  },
  "scrutiny-raised-d2": {
    background: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-200"
  },
  "app-pending-d2": {
    background: "bg-red-200",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-300"
  },
  "scrutiny-raised-d3": {
    background: "bg-red-200",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-300"
  },
  "app-pending-d3": {
    background: "bg-red-300",
    text: "text-gray-100",
    border: "border-red-400",
    hover: "hover:bg-red-400"
  },
  "scrutiny-raised-d4": {
    background: "bg-red-300",
    text: "text-gray-100",
    border: "border-red-400",
    hover: "hover:bg-red-400"
  },
  "app-pending-d4": {
    background: "bg-red-400",
    text: "text-gray-100",
    border: "border-red-500",
    hover: "hover:bg-red-500"
  },
  "app-pending": {
    background: "bg-red-300",
    text: "text-gray-100",
    border: "border-red-400",
    hover: "hover:bg-red-400"
  },
  "certificate-generated": {
    background: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
    hover: "hover:bg-emerald-200"
  },
  close: {
    background: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
    hover: "hover:bg-gray-200"
  },
  "qpr-submitted": {
    background: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-300",
    hover: "hover:bg-purple-200"
  },
  "form-5-submitted": {
    background: "bg-purple-200",
    text: "text-purple-900",
    border: "border-purple-400",
    hover: "hover:bg-purple-300"
  },
  "form-2a-submitted": {
    background: "bg-purple-300",
    text: "text-purple-900",
    border: "border-purple-500",
    hover: "hover:bg-purple-400"
  },
  "work-done": {
    background: "bg-green-300",
    text: "text-green-900",
    border: "border-green-500",
    hover: "hover:bg-green-400"
  },
  "reply-to-notice-sent": {
    background: "bg-pink-100",
    text: "text-pink-800",
    border: "border-pink-300",
    hover: "hover:bg-pink-200"
  },
  "email-sent-to-authority": {
    background: "bg-blue-200",
    text: "text-blue-900",
    border: "border-blue-400",
    hover: "hover:bg-blue-300"
  },
  default: {
    background: "bg-gray-50",
    text: "text-gray-800",
    border: "border-gray-200",
    hover: "hover:bg-gray-100"
  }
};

export default function StatusDropdown({ 
  currentStatus = "", 
  assignmentType = "", 
  onChange,
  disabled = false,
  customClasses = "",
  showIcon = true,
  placeholder = "Select Status",
  maxHeight = "max-h-60",
  clearable = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableOptions, setAvailableOptions] = useState([]);
  const dropdownRef = useRef(null);
  
  // Normalize inputs
  const normalizedType = assignmentType.trim().toLowerCase();
  const normalizedStatus = currentStatus?.toLowerCase() || "";
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
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
  
  // Get appropriate status color classes
  const statusColors = statusColorMap[normalizedStatus] || statusColorMap.default;
  const colorClasses = `${statusColors.background} ${statusColors.text} ${statusColors.border}`;
  const hoverClass = disabled ? '' : statusColors.hover;
  
  // Group options by status type for better organization
  const groupedOptions = () => {
    // This could be enhanced with proper grouping logic in the future
    return availableOptions;
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case "Enter":
      case " ":
        setIsOpen(!isOpen);
        e.preventDefault();
        break;
      default:
        break;
    }
  };
  
  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
  };
  
  return (
    <div className="inline-block w-full font-medium" ref={dropdownRef}>

      
      <div className="">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Select status, current status: ${selectedOption?.label || placeholder}`}
          className={`flex items-center justify-between min-w-[80px] px-3 py-2 text-sm font-medium border rounded-md  
            transition-all duration-200 
            ${colorClasses} 
            ${hoverClass} 
            ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            ${customClasses}`}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center">
            {clearable && normalizedStatus && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear selection"
                className="p-1 mr-1 text-gray-400 rounded-full hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {!disabled && <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />}
          </div>
        </button>
        
        {isOpen && !disabled && (
          <div className="absolute z-50 w-[200px] mt-1 bg-white rounded-md shadow-lg  overflow-hidden">
            <ul 
              role="listbox"
              className={`py-1 overflow-auto ${maxHeight} flex flex-col gap-1 px-1`}
              tabIndex={-1}
            >
              {groupedOptions().map(option => {
                const optionColors = statusColorMap[option.value.toLowerCase()] || statusColorMap.default;
                const isSelected = option.value.toLowerCase() === normalizedStatus;
                
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    className={`px-3 hover:scale-95 py-2 text-sm cursor-pointer rounded-md flex items-center justify-between
                      ${optionColors.background} ${optionColors.text} ${optionColors.border}
                      transition-all duration-150 ${optionColors.hover} 
                      ${isSelected ? 'ring-2 ring-offset-1 ring-[#42dbdb]' : ''}`}
                    onClick={() => {
                      if(option.value === currentStatus) {
                        toast.info("No changes detected in status.");
                        return
                      }
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {isSelected && showIcon && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}