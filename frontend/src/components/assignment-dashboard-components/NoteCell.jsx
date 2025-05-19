import React, { useState } from 'react';

export default function NoteCellWithModal({
    currentNote = { type: '', msg: '' },
    onChange
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [note, setNote] = useState(currentNote);

  const noteTypeOptions = [
    { label: 'Finance Note', value: 'finance_note' },
    { label: 'Technical Note', value: 'technical_note' },
    { label: 'Legal Note', value: 'legal_note' },
    { label: 'IT Note', value: 'it_note' },
    { label: 'General Note', value: 'general_note' },
    { label: 'Reminder (If Any)', value: 'reminder' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange(note)
    setIsModalOpen(false);
    setNote({ type: '', msg: '' });
  };

  return (
    <div className="relative">
      {/* Trigger button (use in table cell) */}
      <div
        onClick={() => setIsModalOpen(true)}
        className=" cursor-pointer min-w-[100px] bg-orange-400"
      >
        {note.type?
        <div>
            <h3 className=' text-lg' >{note.type}</h3>
            <p className='text-sm '>{note.msg}</p>
        </div>
         : 'NA'}
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-gray-100 p-6 rounded-lg shadow-xl space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500  cursor-pointer hover:text-red-500 text-xl"
            >
              ❌
            </button>

            <h2 className="text-2xl font-bold text-center">Add a Note</h2>

            <div>
              <label className="block mb-1 font-medium">Note Type</label>
              <select
                name="type"
                value={note.type}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">-- Select Note Type --</option>
                {noteTypeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Message</label>
              <input
                type="text"
                name="msg"
                value={note.msg}
                onChange={handleChange}
                required
                placeholder="Write your note..."
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#5caaab] text-white font-semibold py-2 rounded hover:bg-[#4c9a9a] transition"
            >
              Submit Note
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
