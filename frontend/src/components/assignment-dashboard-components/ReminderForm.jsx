import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import databaseService from '../../backend-services/database/database';

function ReminderForm({
  setShowReminderForm,
  reminder = { date_and_time: '', message: '' },
  assignmentId,
  currentAssignmentStatus = 'new',
}) {
  const [reminderData, setReminderData] = useState(reminder);
console.log('currentAssignmentStatus: ',currentAssignmentStatus);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReminderData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate input fields
  if (!reminderData.date_and_time || !reminderData.message.trim()) {
    toast.info('⚠️ Please fill in both fields.');
    return;
  }

  // Check if any changes were made
  if (
    reminderData.date_and_time === reminder.date_and_time &&
    reminderData.message === reminder.message
  ) {
    toast.info('ℹ️ No changes made.');
    return;
  }

  console.log("Submitting reminder:", reminderData, "for assignmentId:", assignmentId);

  try {
    const result = await databaseService.setAssignmentReminder(assignmentId, {...reminderData,assignment_status:currentAssignmentStatus});
    toast.success('✅ Reminder set successfully!');
    console.log("Reminder response:", result);
    setShowReminderForm(false);
  } catch (error) {
    console.error("Failed to set reminder:", error);
    toast.error(`❌ ${error.message}`);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-auto min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 my-20 rounded-xl shadow-2xl space-y-5 relative"
      >
        <button
          type="button"
          onClick={() => setShowReminderForm(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl transition"
        >
          <IoClose size={24} />
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800">Set Reminder</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date and Time</label>
          <input
            type="datetime-local"
            name="date_and_time"
            value={reminderData.date_and_time}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            name="message"
            value={reminderData.message}
            onChange={handleChange}
            rows={3}
            placeholder="Write your reminder message..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#5caaab]"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#5caaab] text-white font-semibold py-3 rounded-lg hover:bg-[#4c9a9a] transition-all"
        >
          Save Reminder
        </button>
      </form>
    </div>
  );
}

export default ReminderForm;
