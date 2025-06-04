import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaPlus, 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSort, 
  FaSortUp, 
  FaSortDown,
  FaFilter,
  FaDownload,
  FaBars,
  FaTh
} from 'react-icons/fa';
import { IoClose, IoChevronDown } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import databaseService from "../backend-services/database/database";

const AA = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
const [filters, setFilters] = useState({
  district: '',
  city: '',
  status: '',
});

  // District and City data
  const [districtOptions, setDistrictOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [districtCityMap, setDistrictCityMap] = useState({});

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Expired', label: 'Expired' },
  ];

  // Fetch cities and districts
  useEffect(() => {
    async function fetchCitiesAndDistricts() {
      try {
        const { districtOptions, districtCityMap } = await databaseService.getAllCitiesAndDistricts();
        setDistrictCityMap(districtCityMap);
        setDistrictOptions(districtOptions);
      } catch (error) {
        console.error("Error fetching cities and districts:", error);
        toast.error("❌ Failed to load cities and districts");
      }
    }
    fetchCitiesAndDistricts();
  }, []);

  // Update city options when district changes
  useEffect(() => {
    if (filters.district) {
      setCityOptions(districtCityMap[filters.district] || []);
    } else {
      setCityOptions([]);
    }
  }, [filters.district, districtCityMap]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await databaseService.getAllProjectsForAA();
        console.log(data);
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("❌ Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredAndSortedProjects = useMemo(() => {
let filtered = projects.filter(project => {
  const matchesSearch = 
    project.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.rera_number?.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesDistrict = !filters.district || project.district?.toLowerCase() === filters.district.toLowerCase();
  const matchesCity = !filters.city || project.city?.toLowerCase() === filters.city.toLowerCase();

  // Determine project status
  let projectStatus = 'Active';
  if (project.expiry_date) {
    const expiryDate = new Date(project.expiry_date);
    const today = new Date();
    if (expiryDate < today) {
      projectStatus = 'Expired';
    }
  }
  const matchesStatus = !filters.status || projectStatus === filters.status;



  return (
    matchesSearch &&
    matchesDistrict &&
    matchesCity &&
    matchesStatus 
  );
});

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle null/undefined values
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [projects, searchQuery, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProjects = filteredAndSortedProjects.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    setSelectedIds(prev => 
      prev.length === currentProjects.length 
        ? [] 
        : currentProjects.map(p => p.id)
    );
  };

  const handleSelectItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const clearFilters = () => {
    setFilters({
  district: '',
  city: '',
  status: '',
});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedIds.length} selected projects?`);
    if (!confirmDelete) return;

    setLoading(true);
    try {
      // Delete each selected project
      await Promise.all(selectedIds.map(id => databaseService.deleteProjectById(id)));
      
      // Update local state
      setProjects(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      
      toast.success(`✅ ${selectedIds.length} projects deleted successfully.`);
    } catch (error) {
      console.error("Error deleting projects:", error);
      toast.error("❌ Failed to delete projects.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete project "${name}"?`);
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await databaseService.deleteProjectById(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      toast.success(`✅ Project "${name}" deleted successfully.`);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("❌ Failed to delete project.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/projects/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/projects/view/${id}`);
  };

  const handleNewProjectClick = () => {
    navigate('/projects/add');
  };

  // Get project status based on expiry date
  const getProjectStatus = (project) => {
    if (!project.expiry_date) return 'Active';
    
    const expiryDate = new Date(project.expiry_date);
    const today = new Date();
    
    return expiryDate < today ? 'Expired' : 'Active';
  };

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-teal-600" />
      : <FaSortDown className="text-teal-600" />;
  };

  const getStatusBadge = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Expired: 'bg-red-100 text-red-800',
      Pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="  p-6 pt-0 mb-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2F4C92] mb-2">AA</h1>
              <p className="text-gray-500">Manage and monitor all your projects AA </p>
            </div>
<div className="bg-teal-50 p-4 rounded-xl flex flex-row gap-4 border border-teal-200">
  
  <p className="text-2xl font-bold text-teal-600 mt-1">
    {filteredAndSortedProjects.length}
  </p>
  <div className="flex items-center">
    <span className="text-sm font-medium text-teal-900">Total Projects</span>
  </div>
</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, promoters, or RERA numbers..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200  transition-all duration-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <IoClose size={20} />
                  </button>
                )}
              </div>
            </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
            <>
              <span className="text-blue-600 px-6 py-3 rounded-xl font-medium bg-blue-50  transition-all duration-200 ">
                {selectedIds.length} project{selectedIds.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <FaDownload />
                  Export
                </button> */}
<button 
  onClick={handleBulkDelete}
  className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
>
  <FaTrash className="text-lg" />
  Delete
</button>

              </div>
            </>
        )}

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
                showFilters ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaFilter />
              Filters
              <IoChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>



          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                
                {/* District Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <select
                    value={filters.district}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, district: e.target.value, city: '' }));
                      setCurrentPage(1);
                    }}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                  >
                    <option value="">All Districts</option>
                    {districtOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <select
                    value={filters.city}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, city: e.target.value }));
                      setCurrentPage(1);
                    }}
                    disabled={!filters.district || cityOptions.length === 0}
                    className="w-full p-3 rounded-lg border  border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                  >
                    <option value="">All Cities</option>
                    {cityOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, status: e.target.value }));
                      setCurrentPage(1);
                    }}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                  >
                    <option value="">All Status</option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="mt-4 flex items-center gap-3 justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-[#5caaab] font-medium"
                >
                  Clear All Filters
                </button>
                <span className="text-sm text-gray-500">
                  {filteredAndSortedProjects.length} of {projects.length} projects shown
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          
          {/* Table Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Project List</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:border-[#5caaab] focus:ring-2 focus:ring-[#5caaab] outline-none"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-4 text-gray-500">Loading projects...</p>
            </div>
          ) : filteredAndSortedProjects.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FaSearch size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No projects found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
              {(searchQuery || Object.values(filters).some(f => f !== '' && f !== null)) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === currentProjects.length && currentProjects.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 accent-[#5caaab] text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                    </th>
                    <th className="p-4 text-left">
                      <button
                        onClick={() => handleSort('project_name')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-teal-600"
                      >
                        Project Name
                        {getSortIcon('project_name')}
                      </button>
                    </th>
                    <th className="p-4 text-left">
                      <button
                        onClick={() => handleSort('rera_number')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-teal-600"
                      >
                        RERA Number
                        {getSortIcon('rera_number')}
                      </button>
                    </th>
                    <th>Login ID</th>
                    <th className="p-4 text-left">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-teal-600"
                      >
                        AA Status
                        {getSortIcon('status')}
                      </button>
                    </th>
                    <th>Last Action</th>
                    <th className="p-4 text-left">
                      <button
                        onClick={() => handleSort('district')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-teal-600"
                      >
                        Location
                        {getSortIcon('district')}
                      </button>
                    </th>
                    <th className="p-4 text-center font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProjects.map((project, index) => (
                    <tr
                      key={project.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        selectedIds.includes(project.id) ? 'bg-teal-50' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(project.id)}
                          onChange={() => handleSelectItem(project.id)}
                          className="w-4 h-4 text-teal-600 accent-[#5caaab] border-gray-300 rounded focus:ring-teal-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{project.project_name || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {project.rera_number || 'N/A'}
                        </span>
                      </td>

<td>{project.login_id}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(getProjectStatus(project))}`}>
                          {getProjectStatus(project)}
                        </span>
                      </td>
                      <td>last action</td>
                      <td className="p-4">
                        <div className="text-gray-900">{project.district || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{project.city || 'N/A'}</div>
                      </td>

<td className="p-2">
  <div className="flex w-fit items-center gap-2 p-2 rounded-xl bg-white/80 border border-gray-200/50 hover:shadow-lg transition-all duration-300 group-hover:border-gray-300/60">
    
    {/* View Project */}
    <button
      onClick={() => handleView(project.id)}
      className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
      title="View Project"
    >
      <FaEye className="w-3.5 h-3.5" />
    </button>

    {/* Edit Project */}
    <button
      onClick={() => handleEdit(project.id)}
      className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
      title="Edit Project"
    >
      <FaEdit className="w-3.5 h-3.5" />
    </button>

    {/* Delete Project */}
    <button
      onClick={() => handleDelete(project.id, project.project_name)}
      className="p-2.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
      title="Delete Project"
    >
      <FaTrash className="w-3.5 h-3.5" />
    </button>

  </div>
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {(
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedProjects.length)} of {filteredAndSortedProjects.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium ${
                            currentPage === pageNum
                              ? 'bg-teal-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AA;