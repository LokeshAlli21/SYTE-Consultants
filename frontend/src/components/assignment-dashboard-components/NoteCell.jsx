import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { Check } from 'lucide-react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function NoteCellWithModal({ currentNote = {}, onChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(
    Object.keys(currentNote).filter((key) =>
      ['finance_note', 'technical_note', 'legal_note', 'it_note', 'general_note'].includes(key)
    )
  );
  const [note, setNote] = useState(currentNote);
  const [isOpen, setIsOpen] = useState(false);

  const noteTypeOptions = [
    { label: 'Finance Note', value: 'finance_note' },
    { label: 'Technical Note', value: 'technical_note' },
    { label: 'Legal Note', value: 'legal_note' },
    { label: 'IT Note', value: 'it_note' },
    { label: 'General Note', value: 'general_note' },
  ];

  const toggleSelection = (value) => {
    if (selectedTypes.includes(value)) {
      setSelectedTypes(selectedTypes.filter((v) => v !== value));
      const updatedNote = { ...note };
      delete updatedNote[value];
      setNote(updatedNote);
    } else {
      setSelectedTypes([...selectedTypes, value]);
    }
  };

  const handleNoteChange = (e) => {
    const { name, value } = e.target;
    setNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validNotes = selectedTypes.filter((type) => note[type]?.trim());

    if (validNotes.length === 0) {
      toast.info('Please enter at least one note.');
      return;
    }

    const isSameNote = JSON.stringify(note) === JSON.stringify(currentNote);
    if (isSameNote) {
      toast.info('No changes detected in the note.');
      return;
    }

    console.log(note);
    
    onChange(note);
    setIsModalOpen(false);
  };

  return (
    <div className="relative overflow-visible">
      {/* Trigger */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`group cursor-pointer relative overflow-visible p-2 ${
          selectedTypes.length === 0 ? 'py-4 px-8' : ''
        } bg-gradient-to-r from-[#3daaaa41] to-white border border-indigo-100 hover:shadow-lg transition-all duration-300 rounded-lg max-w-[150px] `}
      >
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-xs px-4 py-2 text-sm text-white bg-gray-900 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
          <div className="flex flex-col gap-1">
            {selectedTypes.length > 0 ? (
  selectedTypes.map((typeKey) => {
    const label = noteTypeOptions.find((n) => n.value === typeKey)?.label;
    const value = note[typeKey];
    return (
      <p key={typeKey}>
        <span className="font-semibold text-teal-300">{label}:</span>{' '}
        {value || 'N/A'}
      </p>
    );
  })
) : (
  <p className="italic text-gray-300">No notes available.</p>
)}

          </div>
        </div>

        {selectedTypes.length ? (
          <div className='whitespace-nowrap'>
            <h3 className="text-base font-semibold  text-indigo-700">
              {selectedTypes
                .map((t) => noteTypeOptions.find((n) => n.value === t)?.label)
                .join(', ')
                .slice(0, 16)}
              {selectedTypes.join(', ').length > 16 ? '...' : ''}
            </h3>
            <p className="text-sm text-gray-700 font-medium whitespace-nowrap">
              {selectedTypes.map((t) => note[t]).join(', ').slice(0, 17)}
              {selectedTypes.map((t) => note[t]).join(', ').length > 17 ? '...' : ''}
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
            <span className="text-base font-medium text-gray-400 italic">Add Note</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-auto min-h-screen">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white p-6 my-20 rounded-xl shadow-2xl space-y-5 absolute top-10 "
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

            {/* Note Type Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Types</label>
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer w-full p-3 border border-gray-300 rounded-lg bg-white flex justify-between items-center"
              >
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {selectedTypes.length ? (
                    selectedTypes.map((t) => {
                      const label = noteTypeOptions.find((n) => n.value === t)?.label;
                      return (
                        <span
                          key={t}
                          className="bg-[#61c1c151] text-xs font-semibold px-3 py-1 rounded-full truncate hover:bg-red-300 max-w-[140px]"
                          title={label}
                          onClick={() => toggleSelection(t)}
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
                      const isSelected = selectedTypes.includes(option.value);
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

            {/* Note Inputs */}
            {selectedTypes.map((type) => (
              <div key={type}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {noteTypeOptions.find((n) => n.value === type)?.label}
                </label>
                <textarea
                  name={type}
                  value={note[type] || ''}
                  onChange={handleNoteChange}
                  required
                  rows={3}
                  placeholder="Write your note..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#5caaab]"
                />
              </div>
            ))}

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
