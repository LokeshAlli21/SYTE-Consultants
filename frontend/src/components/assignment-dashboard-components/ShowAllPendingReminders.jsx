import React, { useEffect, useState } from 'react';
import { IoClose, IoTimeOutline, IoCheckmarkCircle, IoAlertCircle, IoPersonOutline, IoCalendarOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import databaseService from '../../backend-services/database/database';
import { useSelector } from 'react-redux';

function ShowAllPendingReminders({ showAllReminders, setShowAllReminders }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(new Set());
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    if (showAllReminders) {
      fetchPendingReminders();
    }
  }, [showAllReminders]);

  const fetchPendingReminders = async () => {
    setLoading(true);
    try {
      const reminders = await databaseService.getAllPendingReminders();
      console.log(reminders);
      
      setReminders(reminders || []);
    } catch (err) {
      console.error("❌ Failed to fetch reminders:", err);
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id) => {
    if (!userData?.id) {
      toast.error("User not authenticated");
      return;
    }

    setUpdatingStatus(prev => new Set([...prev, id]));
    
    console.log('id: ',id);
    console.log('userData.id: ',userData.id);
    try {
      await databaseService.updateReminderStatus({
        id, 
        updated_by: userData.id
      });
      
      // Remove the reminder from the list after successful update
      setReminders(prev => prev.filter(reminder => reminder.id !== id));
      toast.success("✅ Reminder marked as completed!");
      
    } catch (err) {
      console.error("❌ Failed to update reminder status:", err);
      toast.error(`❌ Failed to update: ${err.message}`);
    } finally {
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'info-pending-syte': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: <IoAlertCircle className="w-3 h-3" />,
        label: 'Info Pending - SYTE' 
      },
      'info-pending-client': { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: <IoPersonOutline className="w-3 h-3" />,
        label: 'Info Pending - Client' 
      },
      'pending': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: <IoTimeOutline className="w-3 h-3" />,
        label: 'Pending' 
      }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now;
    
    return {
      formatted: date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isOverdue
    };
  };

  if (!showAllReminders) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#5caaab] to-[#65aadc] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IoTimeOutline className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Pending Reminders</h2>
              <p className="text-blue-100 text-sm">
                {reminders.length} {reminders.length === 1 ? 'reminder' : 'reminders'} awaiting action
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAllReminders(false)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500 text-lg">Loading reminders...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <IoCheckmarkCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">All caught up!</h3>
              <p className="text-gray-500">No pending reminders found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => {
                const { formatted: dateTime, isOverdue } = formatDateTime(reminder.date_and_time);
                const isUpdating = updatingStatus.has(reminder.id);
                
                return (
                  <div 
                    key={reminder.id} 
                    className={`bg-white border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${
                      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isOverdue ? 'bg-red-100' : 'bg-blue-100'}`}>
                          <IoCalendarOutline className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${isOverdue ? 'text-red-700' : 'text-gray-800'}`}>
                            {dateTime}
                          </p>
                          {isOverdue && (
                            <p className="text-red-600 text-sm font-medium">⚠️ Overdue</p>
                          )}
                        </div>
                      </div>
                      <div className='flex flex-row items-center gap-1 justify-center'>
                        { getStatusBadge(reminder.status)}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Reminder Message:</h4>
                      <p className="text-gray-800 bg-gray-50 rounded-lg p-3 border-l-4 border-blue-400">
                        {reminder.message}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500 font-medium">Assignment ID</p>
                        <p className="text-gray-800 font-semibold">#{reminder.assignment_id}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500 font-medium">Created</p>
                        <p className="text-gray-800">
                          {new Date(reminder.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {/* <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500 font-medium">Last Updated</p>
                        <p className="text-gray-800">
                          {new Date(reminder.updated_at).toLocaleDateString()}
                        </p>
                      </div> */}
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => updateStatus(reminder.id)}
                        disabled={isUpdating}
                        className={`
                          flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                          ${isUpdating 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          }
                        `}
                      >
                        {isUpdating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <IoCheckmarkCircle className="w-5 h-5" />
                            Mark as Completed
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShowAllPendingReminders;