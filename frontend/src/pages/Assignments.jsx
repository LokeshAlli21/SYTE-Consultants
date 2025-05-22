import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash,
  FaSort, FaChartBar, FaListAlt, FaFilter, FaBell, FaRegClock
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import databaseService from "../backend-services/database/database"; // Corrected import path
import StatusDropdown from "../components/assignment-dashboard-components/StatusDropdown"; // Corrected import path
import ReminderForm from "../components/assignment-dashboard-components/ReminderForm";
import NoteCell from "../components/assignment-dashboard-components/NoteCell";     // Corrected import path
import { HiEye, HiEyeOff } from 'react-icons/hi'

// Constants
const ASSIGNMENT_TYPES = [
  { value: 'registration', label: 'Registration' },
  { value: 'extension', label: 'Extension' },
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

const COLOR_PALETTE = [
  "#5CAAAB", "#4CAF50", "#FFA500", "#9C27B0", "#E91E63", "#3F51B5", "#FF5722",
  "#607D8B", "#795548", "#CDDC39", "#00BCD4", "#8BC34A", "#FFC107", "#F44336"
];

function Assignments() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState({ total: 0, statusCounts: {} });
  const [filters, setFilters] = useState({
    type: "",
    status: ""
  });
  const [isFilterVisible, setIsFilterVisible] = useState(false);
        // console.log(assignments);
  // Fetch assignments data
useEffect(() => {
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getAllAssignments();
      console.log('Fetched data:', data);

      // If data is an array itself, use this check:
      if (!Array.isArray(data)) {
        throw new Error('Expected data to be an array');
      }

      const flatAssignments = data?.map((assignment) => {
        const timeline = assignment?.timeline || {};
        return {
          ...assignment,
          assignment_status: timeline?.assignment_status || null,
          event_type: timeline?.event_type || null,
          last_action: timeline?.created_at || null,
          note: timeline?.note || {},
        };
      });

      console.log('formed: ',flatAssignments);
      setAssignments(flatAssignments);

      // Calculate statistics
      const statusCounts = {};
      ASSIGNMENT_TYPES.forEach(option => {
        statusCounts[option.value] = flatAssignments.filter(
          a => a.assignment_type === option.value
        ).length;
      });

      setStats({
        total: flatAssignments.length,
        statusCounts
      });
    } catch (error) {
      toast.error("Failed to load assignments");
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchAssignments();
}, []);

  // Apply filters and search
  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      // Apply type filter
      if (filters.type && a.assignment_type !== filters.type) return false;

      // Apply status filter
      if (filters.status && a.assignment_status !== filters.status) return false;

      // Apply search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          a.assignment_type?.toLowerCase().includes(query) ||
          a.application_number?.toLowerCase().includes(query) ||
          a.project_name?.toLowerCase().includes(query) ||
          a.login_id?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [assignments, searchQuery, filters]);

  // Sort filtered assignments
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
  }, [filteredAssignments, sortField, sortDirection, assignments]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedAssignments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAssignments.slice(indexOfFirstItem, indexOfLastItem);

  // Handlers
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

  const toggleSelectAll = () => {
  if (selectedIds.length === currentItems.length) {
    setSelectedIds([]);
  } else {
    setSelectedIds(currentItems.map((a) => a.id));
  }
};

const toggleSelect = (id) => {
  setSelectedIds((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
};

const goToPage = useCallback((page) => {
  setCurrentPage(page);
  setSelectedIds([]); // Clear selection on page change
}, []);

const handleBulkDelete = async () => {
  if (selectedIds.length === 0) {
    toast.info("Please select assignments first");
    return;
  }

  if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} assignments?`)) return;

  try {
    for (const id of selectedIds) {
      await databaseService.deleteAssignmentById(id);
    }

    setAssignments(prev => prev.filter(a => !selectedIds.includes(a.id)));
    setSelectedIds([]);
    toast.success(`${selectedIds.length} assignments deleted.`);
  } catch (error) {
    toast.error("Failed to delete some assignments");
  }
};

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ type: "", status: "" });
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const handleView = useCallback((id) => navigate(`/assignments/view/${id}`), [navigate]);
  const handleEdit = useCallback((id) => navigate(`/assignments/edit/${id}`), [navigate]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await databaseService.deleteAssignmentById(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
      toast.success("Assignment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete assignment");
      console.error("Error deleting assignment:", error);
    }
  }, []);

const handleStatusChange = useCallback(async (assignmentId, newStatus) => {

  console.log(assignmentId, newStatus);
  
  if (!assignmentId) {
    toast.error("Assignment ID not found");
    return;
  }

  try {
    await databaseService.updateAssignmentStatus(assignmentId, newStatus);
    setAssignments(prev =>
      prev.map(item =>
        item.id === assignmentId ? { ...item, assignment_status: newStatus } : item
      )
    );
    toast.success("Status updated successfully");
  } catch (err) {
    toast.error("Failed to update status");
    console.error("Error updating status:", err);
  }
}, []);

  const getCurrentISTTimestamp = () => {
    const date = new Date();
    return new Date(date.getTime() + 5.5 * 60 * 60 * 1000)
      .toISOString()
      .replace("Z", "+05:30");
  };

const handleNoteChange = useCallback(
  async (assignmentId, notePayload) => {
    console.log("assignmentId:", assignmentId, "notePayload:", notePayload);

    // Expected payload format:
    // {
    //     "finance_note": "",
    //     "technical_note": "",
    //     "legal_note": "",
    //     "it_note": "",
    //     "general_note": ""
    // }

    try {
      if (
        !notePayload ||
        Object.keys(notePayload).length === 0 
      ) {
        toast.error("❌ Invalid note payload.");
        return;
      }

      await databaseService.addAssignmentNote(assignmentId, notePayload);

      // Update local state if needed
      setAssignments(prev =>
        prev.map(item =>
          item.id === assignmentId ? { ...item, note: notePayload.msg } : item
        )
      );

      toast.success("✅ Note added successfully");
    } catch (err) {
      console.error("❌ Error updating note:", err);
      toast.error("❌ Failed to update note");
    }
  },
  []
);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const onTimeline = (id) => {
    navigate(`/assignments/timeline/${id}`)
  }

 return (
  <div className="p-4 md:p-6  lg:p-8 pt-3 min-h-screen max-w-full overflow-x-auto">
    {/* Dashboard Header with Stats */}
    <DashboardHeader
      stats={stats}
      viewMode={viewMode}
      setViewMode={setViewMode}
    />

    {/* Action Bar - Search, Filters, New Button */}
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <SearchBox
          searchQuery={searchQuery}
          onChange={handleSearchChange}
          onClear={() => setSearchQuery("")}
          selectedIds={selectedIds}
          handleBulkDelete={handleBulkDelete}
        />

        <button
          onClick={() => setIsFilterVisible(!isFilterVisible)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition"
        >
          <FaFilter />
          Filters
          {Object.values(filters).some((f) => f) && (
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </button>

        {Object.values(filters).some((f) => f) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2.5 border border-gray-300 rounded-full text-red-500 hover:bg-gray-50 transition"
          >
            <IoClose />
            Clear
          </button>
        )}

        <button
          onClick={() => navigate("/assignments/add")}
          className="ml-auto flex items-center gap-2 bg-[#5CAAAB] text-white px-5 py-3 rounded-full font-semibold text-md shadow-md transition-all duration-200 hover:bg-[#489090] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#5CAAAB]"
        >
          <FaPlus className="text-base" />
          New Assignment
        </button>
      </div>

      {/* Conditionally Render Filter Panel */}
      {isFilterVisible && (
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onClear={clearFilters}
          assignmentTypes={ASSIGNMENT_TYPES}
        />
      )}
    </div>

    {/* Main Content Area */}
    <div className="bg-white rounded-xl shadow-lg ">
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
        <EmptyState
          clearFilters={clearFilters}
          hasFilters={Object.values(filters).some((f) => f)}
        />
      ) : viewMode === "table" ? (
        <>
          <div className=" w-full overflow-visible">
            <table className=" table-auto border-collapse w-full text-sm">
              <TableHead
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                toggleSelectAll={toggleSelectAll}
                selectedIds={selectedIds}
                currentItems={currentItems}
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
                    onNoteChange={handleNoteChange}
                    selectedIds={selectedIds}
                    toggleSelect={toggleSelect}
                    assignmentTypes={ASSIGNMENT_TYPES}
  onTimeline={onTimeline}
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
      ) : (
        <CardView
          assignments={currentItems}
          assignmentTypes={ASSIGNMENT_TYPES}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          pagination={{
            currentPage,
            totalPages,
            goToPage,
            goToPreviousPage,
            goToNextPage,
            indexOfFirstItem,
            indexOfLastItem,
            totalItems: filteredAssignments.length,
          }}
        />
      )}
    </div>
  </div>
);
}

// Component for dashboard header with stats and view toggle
const DashboardHeader = ({ stats, viewMode, setViewMode }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-6 pl-2">
      <div>
        <h1 className="text-3xl font-bold text-[#2F4C92]">Assignments Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage and track all assignment activities</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-white rounded-lg p-1 shadow-sm border">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded ${
              viewMode === "table"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaListAlt className="text-lg" />
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 rounded ${
              viewMode === "cards"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaChartBar className="text-lg" />
          </button>
        </div>

        <div className="w-10 h-10 bg-[#C2C2FF] rounded-full flex items-center justify-center">
          <span className="text-white font-bold">
            {stats.total > 99 ? "99+" : stats.total}
          </span>
        </div>
      </div>
    </div>

    <div className="overflow-x-auto pb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-2 px-2 w-full">
        <div className="min-w-[200px]">
          <StatCard
            title="Total Assignments"
            value={stats.total}
            color="#2F4C92"
            icon={<FaListAlt className="text-2xl" />}
          />
        </div>
        {ASSIGNMENT_TYPES.map((option, index) => {
          const count = stats.statusCounts[option.value] || 0;
          if (!count) return null;

          return (
            <div key={option.value} className="min-w-[200px]">
              <StatCard
                title={option.label}
                value={count}
                color={COLOR_PALETTE[index % COLOR_PALETTE.length]}
              />
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// SearchBox Component (updated styling)
const SearchBox = ({ searchQuery, onChange, onClear ,selectedIds, handleBulkDelete  }) => (
  <>
  <div className="relative flex-1 max-w-[250px]">
    <input
      type="text"
      placeholder="Search assignments..."
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

  {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition"
                >
                  <FaTrash />
                  Delete Selected {selectedIds.length}
                </button>
)}
</>
  
);

// FilterPanel Component (minimal & clean style)
const FilterPanel = ({ filters, onChange, onClear, assignmentTypes }) => (
  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="flex flex-col">
      <label className="text-sm text-gray-500 mb-1">Assignment Type</label>
      <select
        value={filters.type}
        onChange={(e) => onChange("type", e.target.value)}
        className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5CAAAB]"
      >
        <option value="">All Types</option>
        {assignmentTypes.map(type => (
          <option key={type.value} value={type.value}>{type.label}</option>
        ))}
      </select>
    </div>

    <div className="flex flex-col">
      <label className="text-sm text-gray-500 mb-1">Status</label>
      <select
        value={filters.status}
        onChange={(e) => onChange("status", e.target.value)}
        className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5CAAAB]"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="on_hold">On Hold</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>

    <div className="flex items-end">
      <button
        onClick={onClear}
        className="px-4 py-2 rounded-full text-sm text-gray-600 border border-gray-300 hover:bg-gray-100 transition"
      >
        Reset Filters
      </button>
    </div>
  </div>
);

// Table header component
const TableHeader = ({ itemsPerPage, setItemsPerPage, totalItems }) => (
  <div className="flex flex-wrap gap-3 px-6 items-center justify-between my-4 pt-4">
    <h2 className="text-xl font-semibold text-gray-800">Assignment List</h2>
<div className="flex items-center gap-6  ">
  <div className="flex items-center gap-2">
    <label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700">
      Show
    </label>
    <select
      id="itemsPerPage"
      value={itemsPerPage}
      onChange={(e) => setItemsPerPage(Number(e.target.value))}
      className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5caaab] focus:border-transparent"
    >
      <option value={5}>5 per page</option>
      <option value={10}>10 per page</option>
      <option value={20}>20 per page</option>
      <option value={50}>50 per page</option>
    </select>
  </div>
  <span className="text-sm text-gray-600">
    {totalItems} assignments found
  </span>
</div>

  </div>
);

// Loading state component
const LoadingState = () => (
  <div className="py-24 text-center flex flex-col items-center">
    <div className="w-12 h-12 border-4 border-t-[#5CAAAB] border-b-[#5CAAAB] border-l-gray-200 border-r-gray-200 rounded-full animate-spin mb-4"></div>
    <p className="text-gray-500 text-lg">Loading assignments...</p>
  </div>
);

// Empty state component
const EmptyState = ({ clearFilters, hasFilters }) => (
  <div className="py-24 text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
      <FaListAlt className="text-gray-400 text-2xl" />
    </div>
    <p className="text-gray-500 text-lg mb-2">No assignments found</p>
    {hasFilters && (
      <button
        onClick={clearFilters}
        className="text-blue-500 hover:text-blue-700 font-medium"
      >
        Clear filters and try again
      </button>
    )}
  </div>
);

// Table head component
const TableHead = ({ sortField, sortDirection, onSort , toggleSelectAll,selectedIds,currentItems }) => (
  <thead className="bg-gray-50 text-left text-gray-600">
    <tr>
<th className="p-3 border-y font-semibold">
        <input
    type="checkbox"
    onChange={toggleSelectAll}
    checked={
      selectedIds.length === currentItems.length &&
      currentItems.length !== 0
    }
    className="w-4 h-4 accent-[#5CAAAB] cursor-pointer"
  />
</th>
      <th className="p-3 border-y font-semibold">Sr No.</th>

      <SortableHeader field="assignment_type" title="Assignment Type" currentSort={sortField} direction={sortDirection} onSort={onSort} />
      <SortableHeader field="application_number" title="Application Number" currentSort={sortField} direction={sortDirection} onSort={onSort} />
      <SortableHeader field="project_name" title="Project Name" currentSort={sortField} direction={sortDirection} onSort={onSort} />
      <SortableHeader field="login_id" title="Login ID" currentSort={sortField} direction={sortDirection} onSort={onSort} />
      <SortableHeader field="assignment_status" title="Status" currentSort={sortField} direction={sortDirection} onSort={onSort} />
      <SortableHeader field="note" title="Note" currentSort={sortField} direction={sortDirection} onSort={onSort} />
      <th className="p-3 border-y font-semibold text-center">Actions</th>
    </tr>
  </thead>
);

// Table row component
const TableRow = ({
  assignment,
  index,
  onView,
  onEdit,
  onTimeline,
  onDelete,
  onStatusChange,
  onNoteChange,
  assignmentTypes,
  selectedIds,
  toggleSelect
}) => {

    const [showPassword, setShowPassword] = useState(false);
    const [showReminderForm, setShowReminderForm] = useState(false);

    const onReminder = (id) => {
      setShowReminderForm(true)
    }

  return(
  <tr className="border-b hover:bg-gray-50 transition-colors">
<td  className="p-3">
  {/* {console.log(assignment)} */}
      <input
  type="checkbox"
  checked={selectedIds.includes(assignment.id)}
  onChange={() => toggleSelect(assignment.id)}
  className="w-4 h-4 accent-[#5CAAAB] cursor-pointer"
/>
</td>

    <td className="p-3 text-gray-700">{index}</td>
    <td className="p-3">
      <span className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-blue-50 text-blue-700">
        {assignmentTypes?.find(option => option.value === assignment.assignment_type)?.label ?? "NA"}
      </span>
    </td>
    <td className="p-3 font-medium text-gray-800">{assignment.application_number ?? "NA"}</td>
    <td className="p-3 text-gray-700">{assignment.project_name ?? "NA"}</td>

<td className="p-4 text-gray-900 align-top">
  <div className="flex flex-col gap-1">
    <h5 className="text-sm font-semibold text-primary tracking-wide">
      {assignment.login_id ?? 'NA'}
    </h5>

    <div className="text-sm text-gray-600 font-mono flex items-center gap-2">
      {assignment.password ? (
          <div className="text-sm text-gray-600 font-mono flex items-center gap-2">
            {assignment.password ? (
              <div className="flex items-center">
                <span className="tracking-wider">
                  {showPassword ? assignment.password : '•'.repeat(assignment.password.length)}
                </span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-500 hover:text-blue-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                </button>
              </div>
            ) : (
              'NA'
            )}
          </div>
      ) : (
        'NA'
      )}
    </div>
  </div>
</td>


    <td className="p-3">
      <StatusDropdown
        currentStatus={assignment.assignment_status}
        assignmentType={assignment.assignment_type}
        onChange={(newStatus) => onStatusChange(assignment.id, newStatus)}
      />
    </td>
    <td className="p-3">
      <NoteCell
        currentNote={assignment?.note}
        onChange={(newNote) => onNoteChange(assignment.id, newNote)}
      />
    </td>
    <td className="p-3">
<div className="inline-flex items-center gap-1 px-3 py-2 rounded-full border-2 border-[#53d9d9cc] bg-white shadow-sm hover:shadow-lg">
  {/* View */}
  <button
    title="View Details"
    onClick={() => onView(assignment.id)}
    className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
  >
    <FaEye />
  </button>

  {/* Edit */}
  <button
    title="Edit Assignment"
    onClick={() => onEdit(assignment.id)}
    className="p-1.5 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors cursor-pointer"
  >
    <FaEdit />
  </button>

  {/* Delete */}
  <button
    title="Delete Assignment"
    onClick={() => onDelete(assignment.id)}
    className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
  >
    <FaTrash />
  </button>

  {/* Reminder */}
  <div className="relative inline-block">
    <button
      title="Set Reminder"
      onClick={() => onReminder(assignment.id)}
      className="p-1.5 rounded-full bg-orange-50 text-orange-400 hover:bg-orange-100 transition-colors cursor-pointer"
    >
      <FaBell className="text-base" />
    </button>

    {assignment.reminders?.length > 0 && (
      <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[10px] leading-none font-semibold w-4 h-4 flex items-center justify-center rounded-full shadow-md">
        {assignment.reminders.length}
      </span>
    )}
  </div>

    {showReminderForm && <ReminderForm 
    setShowReminderForm={setShowReminderForm}
    assignmentId={assignment.id}
    />}

  {/* Timeline */}
  <button
    title="View Timeline"
    onClick={() => onTimeline(assignment.id)}
    className="p-1.5 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer"
  >
    <FaRegClock />
  </button>
</div>
    </td>
  </tr>
) }

// Card view component
const CardView = ({
  assignments,
  assignmentTypes,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onNoteChange,
  pagination
}) => {
  return (
    <div className="card-view-container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {assignments.map((assignment) => (
          <div 
            key={assignment.id} 
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 truncate">
                  {assignment.project_name || "Unnamed Project"}
                </h3>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {assignmentTypes?.find(option => option.value === assignment.assignment_type)?.label ?? "N/A"}
                </span>
              </div>
              <p className="text-sm text-gray-500">ID: {assignment.login_id ?? "N/A"}</p>
            </div>

            <div className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Application:</span>
                  <span className="font-medium text-gray-800">{assignment.application_number ?? "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <StatusDropdown
                    currentStatus={assignment.assignment_status}
                    assignmentType={assignment.assignment_type}
                    onChange={(newStatus) => onStatusChange(assignment.id, newStatus)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Note:</span>
                  <div className="flex-grow">
                    <NoteCell
                      currentNote={assignment?.note}
                      onChange={(newNote) => onNoteChange(assignment.id, newNote)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onView(assignment.id)} 
                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50" 
                      title="View Details"
                    >
                      <FaEye size={16} />
                    </button>
                    <button 
                      onClick={() => onEdit(assignment.id)} 
                      className="p-2 rounded-md text-yellow-600 hover:bg-yellow-50" 
                      title="Edit Assignment"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(assignment.id)} 
                      className="p-2 rounded-md text-red-600 hover:bg-red-50" 
                      title="Delete Assignment"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">ID: {assignment.id}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            goToPage={pagination.goToPage}
            goToPreviousPage={pagination.goToPreviousPage}
            goToNextPage={pagination.goToNextPage}
            indexOfFirstItem={pagination.indexOfFirstItem}
            indexOfLastItem={pagination.indexOfLastItem}
            totalItems={pagination.totalItems}
          />
        </div>
      )}
    </div>
  );
};

// Pagination

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  indexOfFirstItem,
  indexOfLastItem,
  goToPage,
  goToPreviousPage,
  goToNextPage,
}) => {
  // Helper to get page numbers (with ellipsis for long ranges)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-xl shadow-sm mt-4 flex-wrap gap-2">
      {/* Info */}
      <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
        <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of{" "}
        <span className="font-medium">{totalItems}</span> entries
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* Previous */}
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 text-sm font-medium rounded-md border border-gray-300 ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-2 text-gray-500 select-none">
              ...
            </span>
          ) : (
            <button
              key={index}
              onClick={() => goToPage(page)}
              disabled={page === currentPage}
              className={`px-3 py-1 text-sm font-medium rounded-md border ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600 cursor-default"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 text-sm font-medium rounded-md border border-gray-300 ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg shadow-md bg-white border border-gray-200">
      {/* Left: Icon with colored background */}
      <div
        className="w-12 h-12 flex items-center justify-center rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>

      {/* Right: Title and Value */}
      <div className="flex-1 ml-4 text-right">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-xl font-semibold text-gray-800">{value}</div>
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

export default Assignments;
