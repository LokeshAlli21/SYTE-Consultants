import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash,
  FaSort, FaChartBar, FaListAlt, FaFilter, FaBell, FaRegClock
} from "react-icons/fa";
import { IoClose , IoChevronDown} from "react-icons/io5";
import databaseService from "../backend-services/database/database"; // Corrected import path
import StatusDropdown from "../components/assignment-dashboard-components/StatusDropdown"; // Corrected import path
import ReminderForm from "../components/assignment-dashboard-components/ReminderForm";
import ShowAllPendingReminders from "../components/assignment-dashboard-components/showAllPendingReminders";
import NoteCell from "../components/assignment-dashboard-components/NoteCell";     // Corrected import path
import { HiEye, HiEyeOff } from 'react-icons/hi'
import { useSelector } from "react-redux";
import UserProfile from "../components/UserProfile"; // Corrected import path

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
  const userData = useSelector((state) => state.auth.userData);
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
  const [totalPendingReminders,setTotalPendingReminders] = useState(0)
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

// Updated useEffect to count total pending reminders
useEffect(() => {
  const getTotalPendingReminderscount = async () => {
    let totalCount = 0;
    assignments.forEach(element => {
      if (element.reminders && Array.isArray(element.reminders)) {
        totalCount += element.reminders.length;
      }
    });
    setTotalPendingReminders(totalCount);
  }

  getTotalPendingReminderscount()
}, [assignments])

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
    await databaseService.updateAssignmentStatus(assignmentId,userData?.id, newStatus);
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

      await databaseService.addAssignmentNote(assignmentId, {...notePayload, created_by: userData?.id});

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
  <div className="p-6 min-h-screen max-w-full overflow-x-auto">
    {/* Dashboard Header with Stats */}
    <DashboardHeader
      stats={stats}
      viewMode={viewMode}
      setViewMode={setViewMode}
      totalPendingReminders={totalPendingReminders}
    />

    {/* Action Bar - Search, Filters, New Button */}
 <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
  <div className="flex flex-col lg:flex-row flex-wrap items-center gap-4">

    {/* Search */}
    <div className="flex-1">
      <SearchBox
        searchQuery={searchQuery}
        onChange={handleSearchChange}
        onClear={() => setSearchQuery("")}
        selectedIds={selectedIds}
        handleBulkDelete={handleBulkDelete}
      />
    </div>

    {/* Filter Toggle */}
    <button
      onClick={() => setIsFilterVisible(!isFilterVisible)}
      className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
        isFilterVisible ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <FaFilter />
      Filters
      <IoChevronDown className={`transition-transform ${isFilterVisible ? 'rotate-180' : ''}`} />
      {Object.values(filters).some(f => f) && (
        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
      )}
    </button>


    {/* Clear Filters Button */}
    {Object.values(filters).some(f => f) && (
      <button
        onClick={clearFilters}
        className="px-4 py-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 font-medium transition"
      >
        <IoClose className="inline-block mr-1" />
        Clear Filters
      </button>
    )}

    {/* Add New Assignment */}
    <button
      onClick={() => navigate("/assignments/add")}
      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      <FaPlus className="text-base" />
      New Assignment
    </button>
  </div>

  {/* Filter Panel */}
  {isFilterVisible && (
    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
      <FilterPanel
        filters={filters}
        onChange={handleFilterChange}
        onClear={clearFilters}
        assignmentTypes={ASSIGNMENT_TYPES}
      />
    </div>
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
    <ModernTableContainer>
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
    </ModernTableContainer>

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
const DashboardHeader = ({ stats, viewMode, setViewMode, totalPendingReminders }) => {
  const [showAllReminders, setShowAllReminders] = useState(false);

  return (
    <div className="p-6 pt-0 mb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2F4C92] mb-2">Assignments</h1>
          <p className="text-gray-500">Manage and track all assignment activities</p>
        </div>

        <div className="flex items-center gap-3">
          {/* 🔔 Reminder Bell */}
          <div
            className="relative group"
            onClick={() => setShowAllReminders(true)}
          >
            <div className="relative p-2.5 rounded-xl border-0 border-orange-300/60 hover:border hover:border-orange-300/60 hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300 cursor-pointer">
              <FaBell
                className={`w-6 h-6 transition-all duration-300 ${
                  totalPendingReminders > 0
                    ? "text-orange-500 group-hover:text-orange-600"
                    : "text-gray-500 group-hover:text-gray-700"
                }`}
              />

              {totalPendingReminders > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow-lg shadow-red-500/30">
                  {totalPendingReminders > 99 ? "99+" : totalPendingReminders}
                </span>
              )}

              {totalPendingReminders > 0 && (
                <div className="absolute inset-0 rounded-xl bg-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-[70%] left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
              <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-gray-700/50 whitespace-nowrap">
                {totalPendingReminders > 0
                  ? `${totalPendingReminders} pending reminder${totalPendingReminders !== 1 ? 's' : ''}`
                  : 'No pending reminders'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
              </div>
            </div>
          </div>

          {/* Assignment Stats Box */}
          <div className="bg-teal-50 p-3 rounded-xl flex flex-row gap-4 border items-center border-teal-200">
            <p className="text-2xl font-bold text-teal-600 ">
              {stats.total > 99 ? "99+" : stats.total}
            </p>
            <div className="flex items-center">
              <span className="text-sm font-medium text-teal-900">Total Assignments</span>
            </div>
          </div>

          {/* View Toggle */}
          <div className="bg-white flex flex-row gap-1 items-center rounded-lg p-2 mr-2">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2.5 rounded ${
                viewMode === "table"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaListAlt className="text-lg" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-2.5 rounded ${
                viewMode === "cards"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaChartBar className="text-lg" />
            </button>
          </div>
          <UserProfile />
        </div>
      </div>

      {/* ✅ Moved outside and rendered conditionally */}
      {showAllReminders && (
        <ShowAllPendingReminders
          showAllReminders={showAllReminders}
          setShowAllReminders={setShowAllReminders}
        />
      )}
    </div>
  );
};


// SearchBox Component (updated styling)

const SearchBox = ({ searchQuery, onChange, onClear, selectedIds, handleBulkDelete }) => (
  <div className="flex flex-col md:flex-row items-center gap-4 w-full">
    <div className="relative flex-1 w-full">
      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search assignments..."
        value={searchQuery}
        onChange={onChange}
        className="w-full pl-12 pr-12 py-3 rounded-xl border outline-none border-gray-200 focus:border-[#5CAAAB] focus:ring-2 focus:ring-[#5CAAAB] text-gray-700 placeholder-gray-400 transition-all duration-200"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
        >
          <IoClose size={20} />
        </button>
      )}
    </div>

    {selectedIds.length > 0 && (
      <button
        onClick={handleBulkDelete}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 font-medium transition"
      >
        <FaTrash />
        Delete Selected ({selectedIds.length})
      </button>
    )}
  </div>
);

// FilterPanel Component (minimal & clean style)
const FilterPanel = ({ filters, onChange, onClear, assignmentTypes }) => (
  <div className=" p-4 bg-gray-50 rounded-xl">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Assignment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
        <select
          value={filters.type}
          onChange={(e) => onChange("type", e.target.value)}
          className="w-full p-3 rounded-lg border outline-none border-gray-300 text-sm text-gray-700 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab]"
        >
          <option value="">All Types</option>
          {assignmentTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Status */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
  <select
    value={filters.status}
    onChange={(e) => onChange("status", e.target.value)}
    className="w-full p-3 rounded-lg border outline-none border-gray-300 text-sm text-gray-700 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab]"
  >
    <option value="">All Statuses</option>
    {/* Extended status options from statusColorMap */}
    <option value="new">New</option>
    <option value="info-pending-syte">Info Pending - Syte</option>
    <option value="info-pending-client">Info Pending - Client</option>
    <option value="info-pending-cp">Info Pending - Channel Partner</option>
    <option value="govt-fees-pending">Govt Fees Pending</option>
    <option value="application-done">Application Done</option>
    <option value="scrutiny-raised">Scrutiny Raised</option>
    <option value="scrutiny-raised-d1">Scrutiny Raised D1</option>
    <option value="app-pending-d1">Application Pending D1</option>
    <option value="scrutiny-raised-d2">Scrutiny Raised D2</option>
    <option value="app-pending-d2">Application Pending D2</option>
    <option value="scrutiny-raised-d3">Scrutiny Raised D3</option>
    <option value="app-pending-d3">Application Pending D3</option>
    <option value="scrutiny-raised-d4">Scrutiny Raised D4</option>
    <option value="app-pending-d4">Application Pending D4</option>
    <option value="app-pending">Application Pending</option>
    <option value="certificate-generated">Certificate Generated</option>
    <option value="close">Close</option>
    <option value="qpr-submitted">QPR Submitted</option>
    <option value="form-5-submitted">Form 5 Submitted</option>
    <option value="form-2a-submitted">Form 2A Submitted</option>
    <option value="work-done">Work Done</option>
    <option value="reply-to-notice-sent">Reply to Notice Sent</option>
    <option value="email-sent-to-authority">Email Sent to Authority</option>
  </select>
</div>


      {/* Reset Button */}
      <div className="flex items-end">
        <button
          onClick={onClear}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition"
        >
          Reset Filters
        </button>
      </div>
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
const TableHead = ({ sortField, sortDirection, onSort, toggleSelectAll, selectedIds, currentItems }) => (
  <thead className="bg-gradient-to-r  from-slate-50 rounded-t-2xl to-gray-50 backdrop-blur-sm">
    <tr className="rounded-t-2xl">
      <th className="p-4 border-y border-gray-200/40 font-semibold">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            onChange={toggleSelectAll}
            checked={
              selectedIds.length === currentItems.length &&
              currentItems.length !== 0
            }
            className="w-4 h-4 accent-[#5caaab] cursor-pointer rounded border-gray-300 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
          />
        </div>
      </th>
      <th className="p-4 border-y border-gray-200/40 font-semibold text-gray-700 text-left">
        Sr No.
      </th>
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
      <SortableHeader 
        field="assignment_status" 
        title="Status" 
        currentSort={sortField} 
        direction={sortDirection} 
        onSort={onSort} 
      />
      <SortableHeader 
        field="note" 
        title="Note" 
        currentSort={sortField} 
        direction={sortDirection} 
        onSort={onSort} 
      />
      <th className="p-4 border-y border-gray-200/40 font-semibold text-center text-gray-700">
        Actions
      </th>
    </tr>
  </thead>
);

const ModernTableContainer = ({ children }) => (
  <div className="w-full">
    <div className="bg-white/90   border-y-2 border-gray-200 ">
      <div className="">
        <table className="table-auto  border-collapse w-full text-sm">
          {children}
        </table>
      </div>
    </div>
  </div>
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
    setShowReminderForm(true);
  };

  return (
    <tr className="border-b relative border-gray-100/60 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-300 ease-out ">
      <td className="p-2">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedIds.includes(assignment.id)}
            onChange={() => toggleSelect(assignment.id)}
            className="w-4 h-4 accent-[#5caaab] cursor-pointer rounded border-gray-300 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
          />
        </div>
      </td>

<td className="p-2 text-gray-600 font-medium">
  <div className="flex flex-col gap-1">
    <span>{index}</span>
    <span className="bg-gray-300 rounded px-1 text-xs w-fit">
      ID:{assignment.id}
    </span>
  </div>
</td>
      
      <td className="p-2">
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-gradient-to-r from-teal-500 to-[#5caaab] text-white hover:shadow-md transition-shadow duration-200">
          {assignmentTypes?.find(option => option.value === assignment.assignment_type)?.label ?? "NA"}
        </span>
      </td>
      
      <td className="p-2 font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
        {assignment.application_number ?? "NA"}
      </td>
      
      <td className="p-2 text-gray-700 group-hover:text-gray-800 transition-colors duration-200">
        {assignment.project_name ?? "NA"}
      </td>

      <td className="p-2 text-gray-900">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <h5 className="text-sm font-bold text-gray-800 tracking-wide">
              {assignment.login_id ?? 'NA'}
            </h5>
          </div>

          <div className="text-sm text-gray-600 font-mono">
            {assignment.password ? (
              <div className="flex items-center gap-2 bg-gray-50/80 rounded-lg px-3 py-2 border border-gray-200/50">
                <span className="tracking-wider font-medium">
                  {showPassword ? assignment.password : '•'.repeat(assignment.password.length)}
                </span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 p-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                </button>
              </div>
            ) : (
              <span className="text-gray-400 italic">No password</span>
            )}
          </div>
        </div>
      </td>

      <td className="p-2">
        <StatusDropdown
          currentStatus={assignment.assignment_status}
          assignmentType={assignment.assignment_type}
          onChange={(newStatus) => onStatusChange(assignment.id, newStatus)}
        />
      </td>
      
      <td className="p-2">
        <NoteCell
          currentNote={assignment?.note}
          onChange={(newNote) => onNoteChange(assignment.id, newNote)}
        />
      </td>
      
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-gray-200/60 group-hover:border-gray-300  hover:shadow-lg transition-all duration-300">
    
    {/* View */}
    <button
      title="View Details"
      onClick={() => onView(assignment.id)}
      className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      <FaEye className="w-3.5 h-3.5" />
    </button>

    {/* Edit */}
    <button
      title="Edit Assignment"
      onClick={() => onEdit(assignment.id)}
      className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      <FaEdit className="w-3.5 h-3.5" />
    </button>

    {/* Delete */}
    <button
      title="Delete Assignment"
      onClick={() => onDelete(assignment.id)}
      className="p-2.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      <FaTrash className="w-3.5 h-3.5" />
    </button>

    {/* Reminder */}
    <div className="relative group/reminder">
      <button
        onClick={() => onReminder(assignment.id)}
        className="relative p-2.5 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
        title="Set Reminder"
      >
        <FaBell className="w-3.5 h-3.5" />
        {assignment.reminders?.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow animate-bounce">
            {assignment.reminders.length}
          </span>
        )}
      </button>

      {/* Tooltip Popup */}
      {assignment.reminders?.length > 0 && (
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-xs opacity-0 group-hover/reminder:opacity-100 transition-opacity duration-300 z-50">
          <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-4 relative">
            <div className="flex flex-col gap-3 max-h-40 overflow-y-auto">
              {assignment.reminders.map((reminder, index) => (
                <div key={index} className="border-b border-gray-700/50 pb-2 last:border-b-0 last:pb-0">
                  <div className="text-[11px] font-semibold text-orange-300 mb-1">
                    {new Date(reminder.date_and_time).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gray-200">
                    {reminder.message}
                  </div>
                </div>
              ))}
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
          </div>
        </div>
      )}
    </div>

    {/* Optional Reminder Form */}
    {showReminderForm && (
      <ReminderForm
        setShowReminderForm={setShowReminderForm}
        assignmentId={assignment.id}
        currentAssignmentStatus={assignment.assignment_status}
      />
    )}

    {/* Timeline */}
    <button
      title="View Timeline"
      onClick={() => onTimeline(assignment.id)}
      className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      <FaRegClock className="w-3.5 h-3.5" />
    </button>
  </div>
</td>

    </tr>
  );
};


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
    <div className="flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-sm  rounded-2xl flex-wrap gap-4">
      {/* Enhanced Info */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          <span>Showing</span>
        </div>
        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
          {indexOfFirstItem + 1}
        </span>
        <span>to</span>
        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
          {Math.min(indexOfLastItem, totalItems)}
        </span>
        <span>of</span>
        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
          {totalItems}
        </span>
        <span>entries</span>
      </div>

      {/* Enhanced Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous */}
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-gray-300 hover:border-blue-300 hover:shadow-md hover:scale-105"
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span key={index} className="px-3 py-2 text-gray-500 select-none">
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => goToPage(page)}
                disabled={page === currentPage}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  page === currentPage
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg cursor-default scale-105"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md hover:scale-105"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-gray-300 hover:border-blue-300 hover:shadow-md hover:scale-105"
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
