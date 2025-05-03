import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import databaseService from "../backend-services/database/database";

const Assignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await databaseService.getAllAssignments();
        setAssignments(data);
      } catch (error) {
        toast.error("❌ Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredAssignments = assignments.filter(a =>
    // a.assignment_type.toLowerCase().includes(searchQuery.toLowerCase()) 
    a
  );

  const handleEdit = (id) => {
    navigate(`/assignments/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/assignments/view/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this assignment?`);
    if (!confirmDelete) return;

    try {
      await databaseService.deleteAssignmentById(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
      toast.success(`✅ Assignment deleted successfully.`);
    } catch (error) {
      toast.error("❌ Failed to delete assignment.");
    }
  };

  return (
    <div className="p-8 pt-3">
      <div className="flex items-center justify-between mb-6 pl-6">
        <h1 className="text-[24px] font-bold text-[#2F4C92]">Assignments</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Assignment Type..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-white rounded-full outline-0 px-4 py-2 w-64 pl-10 shadow-sm border border-[#5CAAAB]"
          />
          <span className="absolute top-2.5 left-3 text-gray-400"><FaSearch /></span>
        </div>
        <button
          onClick={() => navigate('/assignments/add')}
          className="ml-auto flex items-center gap-2 bg-[#5CAAAB] text-white px-6 py-2 rounded-full font-medium transition hover:bg-[#489090] shadow-sm"
        >
          <FaPlus /> New Assignment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto px-0 py-6">
        <div className="flex mx-6 items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Assignment List</h2>
          <span className="text-sm text-gray-500">
            {filteredAssignments.length} assignments found
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400 animate-pulse">
            Fetching assignment data...
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            No assignment data available.
          </div>
        ) : (
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600 font-semibold">
                <th className="p-3">Sr No.</th>
                <th className="p-3">Assignment Type</th>
                <th className="p-3">Application Number</th>
                <th className="p-3">Project Name</th>
                <th className="p-3">Login ID</th>
                <th className="p-3">Last Action</th>
                <th className="p-3">Assignment Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((a, idx) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{a.assignment_type}</td>
                  <td className="p-3">{a.application_number}</td>
                  <td className="p-3">{a.project_name}</td>
                  <td className="p-3">{a.login_id}</td>
                  <td className="p-3">{a.last_action}</td>
                  <td className="p-3">{a.assignment_status}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-3 text-[15px]">
                      <button title="View" onClick={() => handleView(a.id)} className="text-blue-400 hover:text-blue-800">
                        <FaEye />
                      </button>
                      <button title="Edit" onClick={() => handleEdit(a.id)} className="text-yellow-500 hover:text-yellow-600">
                        <FaEdit />
                      </button>
                      <button title="Delete" onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Assignments;
