import { Calendar } from 'lucide-react';

// Note type configuration with colors and labels
const noteTypeConfig = {
  finance_note: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
    labelColor: 'text-emerald-700',
    textColor: 'text-emerald-800',
    label: 'Finance Note:'
  },
  technical_note: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    labelColor: 'text-green-700',
    textColor: 'text-green-800',
    label: 'Technical Note:'
  },
  legal_note: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    labelColor: 'text-red-700',
    textColor: 'text-red-800',
    label: 'Legal Note:'
  },
  it_note: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    labelColor: 'text-blue-700',
    textColor: 'text-blue-800',
    label: 'IT Note:'
  },
  general_note: {
    bg: 'bg-gray-50',
    border: 'border-gray-400',
    labelColor: 'text-gray-700',
    textColor: 'text-gray-800',
    label: 'General Note:'
  },
  message: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    labelColor: 'text-yellow-700',
    textColor: 'text-yellow-800',
    label: 'Follow-up:'
  }
};

const NotesDisplay = ({ note, formatDate }) => {
  // Default formatDate function if not provided
  const defaultFormatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date with time for follow-up reminders
  const formatDateWithTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const dateFormatter = formatDate || defaultFormatDate;
  return (
    <div className="mt-2 space-y-1">
      {/* Finance Note */}
      {note.finance_note && (
        <div className="bg-emerald-50 px-3 py-2 rounded-md border-l-4 border-emerald-400">
          <span className="text-xs font-medium text-emerald-700">Finance Note:</span>
          <p className="text-sm text-emerald-800 mt-1">{note.finance_note}</p>
        </div>
      )}

      {/* Technical Note */}
      {note.technical_note && (
        <div className="bg-green-50 px-3 py-2 rounded-md border-l-4 border-green-400">
          <span className="text-xs font-medium text-green-700">Technical Note:</span>
          <p className="text-sm text-green-800 mt-1">{note.technical_note}</p>
        </div>
      )}

      {/* Legal Note */}
      {note.legal_note && (
        <div className="bg-red-50 px-3 py-2 rounded-md border-l-4 border-red-400">
          <span className="text-xs font-medium text-red-700">Legal Note:</span>
          <p className="text-sm text-red-800 mt-1">{note.legal_note}</p>
        </div>
      )}

      {/* IT Note */}
      {note.it_note && (
        <div className="bg-blue-50 px-3 py-2 rounded-md border-l-4 border-blue-400">
          <span className="text-xs font-medium text-blue-700">IT Note:</span>
          <p className="text-sm text-blue-800 mt-1">{note.it_note}</p>
        </div>
      )}

      {/* General Note */}
      {note.general_note && (
        <div className="bg-gray-50 px-3 py-2 rounded-md border-l-4 border-gray-400">
          <span className="text-xs font-medium text-gray-700">General Note:</span>
          <p className="text-sm text-gray-800 mt-1">{note.general_note}</p>
        </div>
      )}

      {/* Follow-up Message */}
      {note.message && (
        <div className="bg-yellow-50 px-3 py-2 rounded-md border-l-4 border-yellow-400">
          <span className="text-xs font-medium text-yellow-700">Follow-up:</span>
          <p className="text-sm text-yellow-800 mt-1">{note.message}</p>
          {note.reminder_date && (
            <div className="flex items-center mt-1 text-xs text-yellow-700">
              <Calendar className="w-3 h-3 mr-1" />
              Due: {formatDateWithTime(note.reminder_date)}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                note.reminder_status === 'pending' 
                  ? 'bg-yellow-200 text-yellow-800' 
                  : 'bg-green-200 text-green-800'
              }`}>
                {note.reminder_status}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Alternative: Dynamic approach using configuration
const DynamicNotesDisplay = ({ note, formatDate }) => {
  // Default formatDate function if not provided
  const defaultFormatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date with time for follow-up reminders
  const formatDateWithTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const dateFormatter = formatDate || defaultFormatDate;
  const noteTypes = Object.keys(noteTypeConfig);
  
  return (
    <div className="mt-2 space-y-1">
      {noteTypes.map(noteType => {
        if (!note[noteType]) return null;
        
        const config = noteTypeConfig[noteType];
        
        return (
          <div key={noteType} className={`${config.bg} px-3 py-2 rounded-md border-l-4 ${config.border}`}>
            <span className={`text-xs font-medium ${config.labelColor}`}>{config.label}</span>
            <p className={`text-sm ${config.textColor} mt-1`}>{note[noteType]}</p>
            
            {/* Special handling for follow-up messages */}
            {noteType === 'message' && note.reminder_date && (
              <div className="flex items-center mt-1 text-xs text-yellow-700">
                <Calendar className="w-3 h-3 mr-1" />
                Due: {formatDateWithTime(note.reminder_date)}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  note.reminder_status === 'pending' 
                    ? 'bg-yellow-200 text-yellow-800' 
                    : 'bg-green-200 text-green-800'
                }`}>
                  {note.reminder_status}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Export both versions
export { NotesDisplay, DynamicNotesDisplay };