import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { Check } from 'lucide-react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { FaBell } from 'react-icons/fa';

export default function NoteCellWithModal({
  currentNote = {
           type: [], msg: '', reminder_date: '' 
        },
  onChange,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [note, setNote] = useState(currentNote);
  const [isOpen, setIsOpen] = useState(false);
console.log(currentNote);

  const noteTypeOptions = [
    { label: 'Finance Note', value: 'finance_note' },
    { label: 'Technical Note', value: 'technical_note' },
    { label: 'Legal Note', value: 'legal_note' },
    { label: 'IT Note', value: 'it_note' },
    { label: 'General Note', value: 'general_note' },
    { label: 'Reminder (If Any)', value: 'reminder' },
  ];

  const toggleSelection = (value) => {
    setNote((prev) => ({
      ...prev,
      type: prev.type.includes(value)
        ? prev.type.filter((v) => v !== value)
        : [...prev.type, value],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {

    if (note.type.includes("reminder") && !note.reminder_date) {
      toast.error("Please select a reminder date.");
      return;
    }

    e.preventDefault();

    const isSameNote = JSON.stringify(note) === JSON.stringify(currentNote);

    if (isSameNote) {
      toast.info("No changes detected in the note.");
    } else {
      onChange(note);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`cursor-pointer relative p-2 ${!note.type?.length && 'py-4 px-8'} bg-gradient-to-r from-[#3daaaa41] to-white border border-indigo-100 hover:shadow-lg transition-all duration-300 rounded-lg`}
      >
        {note.type?.length ? (
<div>
  {/* Note Types */}
  <h3 className="text-base font-semibold text-indigo-700">
    {(() => {
      const labels = note.type
        ?.map((t) => noteTypeOptions.find((n) => n.value === t)?.label)
        .join(', ');
      return labels?.length > 20 ? labels.slice(0, 20) + '...' : labels;
    })()}
  </h3>

  {/* Note Message */}
  <p className="text-sm text-gray-700 font-medium whitespace-nowrap">
    {note.msg.length > 20 ? note.msg.slice(0, 20) + '...' : note.msg}
  </p>

  {/* Reminder Display */}
  {note.reminder_date && (
    <div className="flex items-center gap-1 mt-[2px] text-sm text-gray-500">
      <FaBell className="text-[#5caaab]  mt-[2px]" />
      <span>{new Date(note.reminder_date).toLocaleString()}</span>
    </div>
  )}
</div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
            <span className="text-base font-medium text-gray-400 italic">Add Note</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white p-6 rounded-xl shadow-2xl space-y-5 relative"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl transition"
              aria-label="Close Modal"
            >
              <IoClose size={24} />
            </button>

            <h2 className="text-2xl font-bold text-center text-gray-800">Add a Note</h2>

            {/* Custom Multi-select Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Types</label>
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer w-full p-3 border border-gray-300 rounded-lg bg-white flex justify-between items-center"
              >
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {note.type.length ? (
                    note.type.map((t) => {
                      const label = noteTypeOptions.find((n) => n.value === t)?.label;
                      return (
                        <span
                          key={t}
                          className="bg-[#61c1c151] text-xs font-semibold px-3 py-1 rounded-full truncate max-w-[140px]"
                          title={label}
                        >
                          {label}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-400 italic text-sm">-- Select Note Types --</span>
                  )}
                </div>

                {isOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
              </div>

              {isOpen && (
                <div className="absolute z-30 w-full mt-1 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200">
                  <ul className="py-1 max-h-48 overflow-auto flex flex-col gap-1 px-1" tabIndex={-1}>
                    {noteTypeOptions.map((option) => {
                      const isSelected = note.type.includes(option.value);
                      return (
                        <li
                          key={option.value}
                          role="option"
                          aria-selected={isSelected}
                          className={`px-3 py-2 text-sm cursor-pointer rounded-md flex items-center justify-between 
                            bg-white text-gray-800 border border-gray-200 transition-all duration-150 hover:bg-gray-100
                            ${isSelected ? 'ring-2 ring-offset-1 ring-[#42dbdb]' : ''}`}
                          onClick={() => toggleSelection(option.value)}
                        >
                          <span>{option.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="msg"
                value={note.msg}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Write your note..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#5caaab]"
              />
            {note.type.includes("reminder") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Date & Time</label>
                <input
                  type="datetime-local"
                  name="reminder_date"
                  value={note.reminder_date}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]"
                  required
                />
              </div>
            )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#5caaab] text-white font-semibold py-3 rounded-lg hover:bg-[#4c9a9a] transition-all"
            >
              Submit Note
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
