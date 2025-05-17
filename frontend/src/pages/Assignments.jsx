import { useState, useEffect, useMemo, useCallback } from "react";
import React from 'react'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaSort } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import databaseService from "../backend-services/database/database";
import StatusDropdown from "../components/assignment-dashboard-components/StatusDropdown";

// Moved to separate files/constants for better organization
// import { assignmentOptions, statusOptionsByType, statusColorMap, colorPalette } from "./assignmentConstants";

const assignmentOptions = [
  { value: 'registration', label: 'Registration' },
  { value: 'extension', label: 'Extension' },
  // { value: 'bank_account_change', label: 'Bank Account Change' },
  { value: 'correction', label: 'Correction' },
  { value: 'change', label: 'Change' },
  { value: 'deregister', label: 'Deregister' },
  { value: 'abeyance', label: 'Abeyance' },
  { value: 'lapsed', label: 'Lapsed' },
  { value: 'closure', label: 'Closure' },
  { value: 'general_update', label: 'General Update' },
  { value: 'qpr_notice', label: 'QPR Notice' },
  { value: 'advertisement_notice', label: 'Advertisement Notice' },
  { value: 'other_notice', label: 'Other Notice' },
  { value: 'login_id_retrieval', label: 'Login Id Retrieval' },
];

 const colorPalette = [
  "#5CAAAB", "#4CAF50", "#FFA500", "#9C27B0", "#E91E63", "#3F51B5", "#FF5722",
  "#607D8B", "#795548", "#CDDC39", "#00BCD4", "#8BC34A", "#FFC107", "#F44336"
];

function Assignments(){
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState({ total: 0, statusCounts: {} });

  // Fetch assignments data
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await databaseService.getAllAssignments();
        setAssignments(data);
        
        // Calculate statistics
        const statusCounts = {};
        assignmentOptions.forEach(option => {
          statusCounts[option.value] = data.filter(
            a => a.assignment_type === option.value
          ).length;
        });

        // console.log(data);
        // console.log(assignmentOptions);
        
        

        setStats({
          total: data.length,
          statusCounts
        });
      } catch (error) {
        toast.error("❌ Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // Memoize filtered assignments for performance
  const filteredAssignments = useMemo(() => {
    if (!searchQuery.trim()) return assignments;
    
    const query = searchQuery.toLowerCase();
    return assignments.filter(a =>
      a.assignment_type?.toLowerCase().includes(query) ||
      a.application_number?.toLowerCase().includes(query) ||
      a.project_name?.toLowerCase().includes(query) ||
      a.login_id?.toLowerCase().includes(query)
    );
  }, [assignments, searchQuery]);

  // Memoize sorted assignments to prevent unnecessary re-renders
  const sortedAssignments = useMemo(() => {
    return [...filteredAssignments].sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      
      if (sortDirection === "asc") {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [filteredAssignments, sortField, sortDirection]);

  // Calculate pagination values
  const totalPages = Math.ceil(sortedAssignments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAssignments.slice(indexOfFirstItem, indexOfLastItem);

  // Handle sorting - moved to useCallback to prevent recreation on each render
  const handleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) {
        setSortDirection(prevDir => prevDir === "asc" ? "desc" : "asc");
        return field;
      } else {
        setSortDirection("asc");
        return field;
      }
    });
  }, []);

  // Handle search
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Handle actions
  const handleView = useCallback((id) => navigate(`/assignments/view/${id}`), [navigate]);
  const handleEdit = useCallback((id) => navigate(`/assignments/edit/${id}`), [navigate]);
  
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    setLoading(true);
    try {
      await databaseService.deleteAssignmentById(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
      toast.success("Assignment deleted successfully.");
    } catch (error) {
      toast.error("❌ Failed to delete assignment.");
    } finally {
      setLoading(false);
    }
  }, []);

const handleStatusChange = useCallback(async (assignmentId, newStatus) => {
  console.log("🔄 Updating status:", newStatus, "for Assignment ID:", assignmentId);

  try {
    await databaseService.updateAssignmentStatus(assignmentId, newStatus);

    setAssignments(prev =>
      prev.map(item =>
        item.id === assignmentId ? { ...item, assignment_status: newStatus } : item
      )
    );

    toast.success("Status updated successfully!");
    console.log("Status updated successfully");
  } catch (err) {
    console.error("❌ Failed to update status:", err.message);
    // toast.error(`❌ Failed to update status: ${err.message}`);
  }
}, []);

  // Handle page changes
  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-3">
      {/* Header with Stats Cards */}
      <DashboardHeader stats={stats} />

      {/* Search + New Button */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <SearchBox 
          searchQuery={searchQuery} 
          onChange={handleSearchChange} 
          onClear={() => setSearchQuery("")} 
        />
        
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
        <TableHeader 
          itemsPerPage={itemsPerPage} 
          setItemsPerPage={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
          totalItems={filteredAssignments.length}
        />

        {loading ? (
          <LoadingState />
        ) : filteredAssignments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-auto min-h-max">
              <table className="w-full table-auto border-collapse text-sm">
                <TableHead 
                  sortField={sortField} 
                  sortDirection={sortDirection} 
                  onSort={handleSort} 
                />
                <tbody>
                  {currentItems.map((assignment, idx) => (
                    <TableRow 
                      key={assignment.id}
                      assignment={assignment}
                      index={indexOfFirstItem + idx + 1}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              goToPage={goToPage}
              goToPreviousPage={goToPreviousPage}
              goToNextPage={goToNextPage}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              totalItems={filteredAssignments.length}
            />
          </>
        )}
      </div>
    </div>
  );
};

// Extracted Components for better organization and reusability

const DashboardHeader = ({ stats }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-4 pl-2">
      <h1 className="text-2xl font-bold text-[#2F4C92]">Assignments Dashboard</h1>
      <div className="w-10 h-10 bg-[#C2C2FF] rounded-full" />
    </div>

    <div className="overflow-x-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 pb-4 px-2 m-w-full">
        <div className="min-w-[200px]">
          <StatCard
            title="Total Assignments"
            value={stats.total}
            color="#2F4C92"
          />
        </div>
        {assignmentOptions.map((option, index) => {
          const count = stats.statusCounts[option.value] || 0;
          if (!count) return null;
          
          return (
            <div key={option.value} className="min-w-[200px]">
              <StatCard
                title={option.label}
                value={count}
                color={colorPalette[index % colorPalette.length]}
              />
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const SearchBox = ({ searchQuery, onChange, onClear }) => (
  <div className="relative w-full max-w-sm shadow-md rounded-full">
    <input
      type="text"
      placeholder="Search here..."
      value={searchQuery}
      onChange={onChange}
      className="w-full pl-10 pr-10 py-2.5 rounded-full border border-[#5CAAAB] font-medium text-zinc-500 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5CAAAB] transition duration-200"
    />
    <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#5CAAAB] text-base" />
    {searchQuery && (
      <button
        type="button"
        onClick={onClear}
        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
      >
        <IoClose className="text-2xl" />
      </button>
    )}
  </div>
);

const TableHeader = ({ itemsPerPage, setItemsPerPage, totalItems }) => (
  <div className="flex mx-6 items-center justify-between my-4 pt-4">
    <h2 className="text-xl font-semibold text-gray-800">Assignment List</h2>
    <div className="flex items-center gap-4">
      <select 
        value={itemsPerPage}
        onChange={(e) => setItemsPerPage(Number(e.target.value))}
        className="border rounded p-1 text-sm"
      >
        <option value={5}>5 per page</option>
        <option value={10}>10 per page</option>
        <option value={20}>20 per page</option>
      </select>
      <span className="text-sm text-gray-500">
        {totalItems} assignments found
      </span>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="py-10 text-center text-gray-400 animate-pulse">
    Fetching assignment data...
  </div>
);

const EmptyState = () => (
  <div className="py-10 text-center text-gray-400">
    No assignment data available.
  </div>
);

const TableHead = ({ sortField, sortDirection, onSort }) => (
  <thead className="bg-gray-50">
    <tr className="text-left text-gray-600 font-semibold">
      <th className="p-3">Sr No.</th>
      <SortableHeader 
        field="assignment_type" 
        title="Assignment Type" 
        currentSort={sortField} 
        direction={sortDirection} 
        onSort={onSort} 
      />
      <SortableHeader 
        field="application_number" 
        title="Application Number" 
        currentSort={sortField} 
        direction={sortDirection} 
        onSort={onSort} 
      />
      <SortableHeader 
        field="project_name" 
        title="Project Name" 
        currentSort={sortField} 
        direction={sortDirection} 
        onSort={onSort} 
      />
      <SortableHeader 
        field="login_id" 
        title="Login ID" 
        currentSort={sortField} 
        direction={sortDirection} 
        onSort={onSort} 
      />
      <th className="p-3">Last Action</th>
      <SortableHeader 
        field="assignment_status" 
        title="Status" 
        currentSort={sortField} 
        direction={sortDirection} 
        onSort={onSort} 
      />
      <th className="p-3 text-center">Action</th>
    </tr>
  </thead>
);

const TableRow = ({ assignment, index, onView, onEdit, onDelete, onStatusChange, }) => (
  <tr className="border-b hover:bg-gray-50">
    <td className="p-3">{index}</td>

    <td className="p-3">
      {assignmentOptions?.find(option => option.value === assignment.assignment_type)?.label ?? "NA"}
    </td>

    <td className="p-3">{assignment.application_number ?? "NA"}</td>
    <td className="p-3">{assignment.project_name ?? "NA"}</td>
    <td className="p-3">{assignment.login_id ?? "NA"}</td>
    <td className="p-3">{assignment.last_action ?? "NA"}</td>

    <td className="p-3">
      <StatusDropdown
        currentStatus={assignment.assignment_status}
        assignmentType={assignment.assignment_type}
        onChange={(newStatus) => onStatusChange(assignment.id, newStatus)}
      />
    </td>

    <td className="p-3 text-center">
      <div className="flex items-center justify-center gap-3 text-[15px]">
        <button
          title="View"
          onClick={() => onView(assignment.id)}
          className="text-blue-400 hover:text-blue-800"
        >
          <FaEye />
        </button>
        <button
          title="Edit"
          onClick={() => onEdit(assignment.id)}
          className="text-yellow-500 hover:text-yellow-600"
        >
          <FaEdit />
        </button>
        <button
          title="Delete"
          onClick={() => onDelete(assignment.id)}
          className="text-red-400 hover:text-red-600"
        >
          <FaTrash />
        </button>
      </div>
    </td>
  </tr>
);


const Pagination = ({ 
  currentPage, 
  totalPages, 
  goToPage, 
  goToPreviousPage, 
  goToNextPage, 
  indexOfFirstItem, 
  indexOfLastItem, 
  totalItems 
}) => (
  <div className="flex items-center justify-between px-6 py-4">
    <div className="text-sm text-gray-500">
      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
    </div>
    <div className="flex gap-2">
      <button
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded border ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-blue-500 hover:bg-blue-50"
        }`}
      >
        Previous
      </button>
      {generatePaginationButtons(currentPage, totalPages, goToPage)}
      <button
        onClick={goToNextPage}
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
);

// Helper function for pagination buttons
const generatePaginationButtons = (currentPage, totalPages, goToPage) => {
  const pages = [];
  const pagesToShow = [1]; // Always show first page
  
  // Add current page and surrounding pages
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pagesToShow.push(i);
  }
  
  if (totalPages > 1) pagesToShow.push(totalPages); // Always show last page
  
  // Sort and remove duplicates
  const uniquePages = [...new Set(pagesToShow)].sort((a, b) => a - b);
  
  let prevPage = 0;
  uniquePages.forEach(page => {
    if (page - prevPage > 1) {
      pages.push(<span key={`ellipsis-${prevPage}`} className="px-3 py-1">...</span>);
    }
    pages.push(
      <button
        key={page}
        onClick={() => goToPage(page)}
        className={`px-3 py-1 rounded border ${
          currentPage === page
            ? "bg-blue-500 text-white"
            : "bg-white text-blue-500 hover:bg-blue-50"
        }`}
      >
        {page}
      </button>
    );
    prevPage = page;
  });
  
  return pages;
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

// Stats card component
const StatCard = ({ title, value, color }) => (
  <div
    className="rounded-xl shadow-md px-4 py-5 text-white w-full h-full"
    style={{ backgroundColor: color }}
  >
    <h3 className="text-base font-semibold truncate">{title}</h3>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

export default Assignments;