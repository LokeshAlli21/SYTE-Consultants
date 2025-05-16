import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaSort } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import databaseService from "../backend-services/database/database";

const Assignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0
  });

  // Fetch assignments data
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await databaseService.getAllAssignments();
        setAssignments(data);
        
        // Calculate statistics
        setStats({
          total: data.length,
          active: data.filter(a => a.assignment_status === "Active").length,
          completed: data.filter(a => a.assignment_status === "Completed").length,
          pending: data.filter(a => a.assignment_status === "Pending").length
        });
      } catch (error) {
        toast.error("❌ Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // Filter assignments based on search query
  const filteredAssignments = assignments.filter(a =>
    a.assignment_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.application_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.login_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort assignments
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    
    if (sortDirection === "asc") {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAssignments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAssignments.length / itemsPerPage);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle actions
  const handleView = (id) => navigate(`/assignments/view/${id}`);
  const handleEdit = (id) => navigate(`/assignments/edit/${id}`);
  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    setLoading(true);
    try {
      await databaseService.deleteAssignmentById(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
      toast.success("✅ Assignment deleted successfully.");
    } catch (error) {
      toast.error("❌ Failed to delete assignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-3">
      {/* Header with Stats Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 pl-2">
          <h1 className="text-2xl font-bold text-[#2F4C92]">Assignments Dashboard</h1>
          <div className="w-10 h-10 bg-[#C2C2FF] rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Assignments" value={stats.total} color="#2F4C92" />
          <StatCard title="Active" value={stats.active} color="#5CAAAB" />
          <StatCard title="Completed" value={stats.completed} color="#4CAF50" />
          <StatCard title="Pending" value={stats.pending} color="#FFA500" />
        </div>
      </div>

      {/* Search + New Button */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="relative w-full max-w-sm shadow-md rounded-full">
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2.5 rounded-full border border-[#5CAAAB] font-medium text-zinc-500 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5CAAAB] transition duration-200"
          />
          <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#5CAAAB] text-base" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
            >
              <IoClose className="text-2xl" />
            </button>
          )}
        </div>

        <button
          onClick={() => navigate("/assignments/add")}
          className="ml-auto flex items-center gap-2 bg-[#5CAAAB] text-white px-5 py-3 rounded-full font-semibold text-md shadow-xl transition-all duration-200 hover:bg-[#489090] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#5CAAAB]"
        >
          <FaPlus className="text-base" />
          New Assignment
        </button>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex mx-6 items-center justify-between my-4 pt-4">
          <h2 className="text-xl font-semibold text-gray-800">Assignment List</h2>
          <div className="flex items-center gap-4">
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded p-1 text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
            <span className="text-sm text-gray-500">
              {filteredAssignments.length} assignments found
            </span>
          </div>
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
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-600 font-semibold">
                    <th className="p-3">Sr No.</th>
                    <SortableHeader 
                      field="assignment_type" 
                      title="Assignment Type" 
                      currentSort={sortField} 
                      direction={sortDirection} 
                      onSort={handleSort} 
                    />
                    <SortableHeader 
                      field="application_number" 
                      title="Application Number" 
                      currentSort={sortField} 
                      direction={sortDirection} 
                      onSort={handleSort} 
                    />
                    <SortableHeader 
                      field="project_name" 
                      title="Project Name" 
                      currentSort={sortField} 
                      direction={sortDirection} 
                      onSort={handleSort} 
                    />
                    <SortableHeader 
                      field="login_id" 
                      title="Login ID" 
                      currentSort={sortField} 
                      direction={sortDirection} 
                      onSort={handleSort} 
                    />
                    <th className="p-3">Last Action</th>
                    <SortableHeader 
                      field="assignment_status" 
                      title="Status" 
                      currentSort={sortField} 
                      direction={sortDirection} 
                      onSort={handleSort} 
                    />
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((a, idx) => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{indexOfFirstItem + idx + 1}</td>
                      <td className="p-3">{a.assignment_type ?? "NA"}</td>
                      <td className="p-3">{a.application_number ?? "NA"}</td>
                      <td className="p-3">{a.project_name ?? "NA"}</td>
                      <td className="p-3">{a.login_id ?? "NA"}</td>
                      <td className="p-3">{a.last_action ?? "NA"}</td>
                      <td className="p-3">
                        <StatusBadge status={a.assignment_status} />
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-3 text-[15px]">
                          <button
                            title="View"
                            onClick={() => handleView(a.id)}
                            className="text-blue-400 hover:text-blue-800"
                          >
                            <FaEye />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => handleEdit(a.id)}
                            className="text-yellow-500 hover:text-yellow-600"
                          >
                            <FaEdit />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => handleDelete(a.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAssignments.length)} of {filteredAssignments.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, i, arr) => (
                    <>
                      {i > 0 && arr[i - 1] !== page - 1 && (
                        <span key={`ellipsis-${i}`} className="px-3 py-1">...</span>
                      )}
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded border ${
                          currentPage === page
                            ? "bg-blue-500 text-white"
                            : "bg-white text-blue-500 hover:bg-blue-50"
                        }`}
                      >
                        {page}
                      </button>
                    </>
                  ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Component for sortable table headers
const SortableHeader = ({ field, title, currentSort, direction, onSort }) => (
  <th 
    className="p-3 cursor-pointer hover:bg-gray-100"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1">
      {title}
      {currentSort === field && (
        <FaSort className={`text-xs ${direction === "asc" ? "rotate-0" : "rotate-180"}`} />
      )}
    </div>
  </th>
);

// Component for status badges
const StatusBadge = ({ status }) => {
  let color = "bg-gray-200 text-gray-800";
  
  if (!status) return <span className={`px-2 py-1 rounded-full text-xs ${color}`}>NA</span>;
  
  switch (status.toLowerCase()) {
    case "active":
      color = "bg-green-100 text-green-800";
      break;
    case "completed":
      color = "bg-blue-100 text-blue-800";
      break;
    case "pending":
      color = "bg-yellow-100 text-yellow-800";
      break;
    case "rejected":
      color = "bg-red-100 text-red-800";
      break;
    default:
      color = "bg-gray-200 text-gray-800";
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
      {status}
    </span>
  );
};

// Stats card component
const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-md border-l-4" style={{ borderLeftColor: color }}>
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
  </div>
);

export default Assignments;