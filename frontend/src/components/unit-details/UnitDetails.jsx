import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import databaseService from '../../backend-services/database/database';
import {UnitDetailsForm} from '../index.js';
import { IoClose } from "react-icons/io5";

function UnitDetails({
  disabled,
  setPrevProjectUnitDetails, 
  projectId, 
  setIsUnitDetailsFormActive, 
  isUnitDetailsFormActive,
  formData,
  setFormData,
  handleSubmitProjectUnit, 
  handleUpdateProjectUnit
}) {
  const [isDisabled, setIsDesabled] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [unitsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const indexOfLastUnit = currentPage * unitsPerPage;
  const indexOfFirstUnit = indexOfLastUnit - unitsPerPage;
  
  const filteredUnits = units.filter((u) =>
    u.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.unit_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const currentUnits = filteredUnits.slice(indexOfFirstUnit, indexOfLastUnit);

  useEffect(() => {
    if(isUnitDetailsFormActive) return;
    
    const fetchUnits = async () => {
      if(projectId) {
        try {
          const data = await databaseService.getAllUnitsForProject(projectId);
          setUnits(data);
        } catch (error) {
          toast.error("❌ Failed to load unit details");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUnits();
    setFormData(resetObjectData(formData));
  }, [isUnitDetailsFormActive, projectId]);

  function resetObjectData(obj) {
    if (Array.isArray(obj)) return [];
    
    const clearedObj = {};
    
    for (const key in obj) {
      const value = obj[key];
      
      if (key === 'project_id') {
        clearedObj[key] = value;
        continue;
      }
      
      if (typeof value === "string") {
        clearedObj[key] = "";
      } else if (typeof value === "number") {
        clearedObj[key] = '';
      } else if (typeof value === "boolean") {
        clearedObj[key] = false;
      } else if (Array.isArray(value)) {
        clearedObj[key] = [];
      } else if (typeof value === "object" && value !== null) {
        clearedObj[key] = resetObjectData(value);
      } else {
        clearedObj[key] = value;
      }
    }
    
    return clearedObj;
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredUnits.length ? [] : filteredUnits.map((u) => u.id)
    );
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete unit "${name}"?`);
    if (!confirmDelete) return;
  
    try {
      await databaseService.deleteProjectUnitById(id);
      setUnits(prev => prev.filter(unit => unit.id !== id));
      setSelectedIds(prev => prev.filter(unitId => unitId !== id));
      toast.success(`✅ Unit "${name}" deleted successfully.`);
    } catch (error) {
      toast.error("❌ Failed to delete unit.");
    }
  };  

  const handleEdit = async (id) => {
    try {
      setIsDesabled(false);
      const unit = await databaseService.getUnitById(id);
      
      if (unit) {
        setFormData(unit); 
        setPrevProjectUnitDetails(unit); 
        setCurrentUnitId(id);
        setIsUnitDetailsFormActive(true);
      } else {
        toast.error("❌ Unit not found");
      }
    } catch (error) {
      console.error("❌ Error fetching unit for edit:", error);
      toast.error("❌ Failed to load unit for editing.");
    }
  };
  
  const handleView = async (id) => {
    try {
      setIsDesabled(true);
      const unit = await databaseService.getUnitById(id);
      
      if (unit) {
        setFormData(unit);
        setIsUnitDetailsFormActive(true);
      } else {
        toast.error("❌ Unit not found");
      }
    } catch (error) {
      console.error("❌ Error fetching unit for view:", error);
      toast.error("❌ Failed to load unit for viewing.");
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'NA';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Sold': 'bg-green-100 text-green-800',
      'Unsold': 'bg-red-100 text-red-800', 
      'Booked': 'bg-blue-100 text-blue-800',
      'Available': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'NA'}
      </span>
    );
  };

  if(!projectId) return null;

  if(isUnitDetailsFormActive) {
    return (
      <UnitDetailsForm
        setIsUnitDetailsFormActive={setIsUnitDetailsFormActive}
        formData={formData}
        disabled={isDisabled}
        setFormData={setFormData}
        currentUnitId={currentUnitId}
        setCurrentUnitId={setCurrentUnitId}
        setIsDesabled={setIsDesabled}
        handleUpdateProjectUnit={handleUpdateProjectUnit}
        handleSubmitProjectUnit={handleSubmitProjectUnit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Unit Management Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your project units efficiently</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Units</p>
                  <p className="text-2xl font-bold text-blue-600">{units.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <div className="w-6 h-6 bg-blue-600 rounded"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sold Units</p>
                  <p className="text-2xl font-bold text-green-600">
                    {units.filter(u => u.unit_status === 'Sold').length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <div className="w-6 h-6 bg-green-600 rounded"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Units</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {units.filter(u => u.unit_status === 'Unsold' || u.unit_status === 'Available').length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <div className="w-6 h-6 bg-yellow-600 rounded"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(units.reduce((sum, u) => sum + (u.total_received || 0), 0))}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <div className="w-6 h-6 bg-purple-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Toolbar */}
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search units..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 font-medium text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5CAAAB] focus:border-[#5CAAAB] transition duration-200"
                />
                <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#5CAAAB] text-base" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange({ target: { value: "" } })}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                  >
                    <IoClose className="text-xl" />
                  </button>
                )}
              </div>

              {!disabled && (
                <button
                  onClick={() => setIsUnitDetailsFormActive(true)}
                  className="flex items-center gap-2 bg-[#5CAAAB] text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 hover:bg-[#489090] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#5CAAAB]"
                >
                  <FaPlus className="text-base" />
                  Add New Unit
                </button>
              )}
            </div>

            {/* Selected Items Info */}
            {selectedIds.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  {selectedIds.length} unit{selectedIds.length > 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5CAAAB]"></div>
                <p className="mt-4 text-gray-500">Loading unit data...</p>
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-lg font-medium">No units found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        disabled={disabled}
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={selectedIds.length === filteredUnits.length && filteredUnits.length > 0}
                        className="rounded border-gray-300 text-[#5CAAAB] focus:ring-[#5CAAAB]"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sr No.</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Carpet Area</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Agreement Value</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Received</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUnits.map((u, idx) => {
                    const selected = selectedIds.includes(u.id);
                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors duration-150 ${
                          selected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            disabled={disabled}
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelect(u.id)}
                            className="rounded border-gray-300 text-[#5CAAAB] focus:ring-[#5CAAAB]"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {indexOfFirstUnit + idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{u.unit_name || 'NA'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.unit_type || 'NA'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {u.carpet_area ? `${u.carpet_area} sq ft` : 'NA'}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(u.unit_status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.customer_name || 'NA'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(u.agreement_value)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          {formatCurrency(u.total_received)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-red-600">
                          {formatCurrency(u.balance_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              title="View"
                              onClick={() => handleView(u.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            {!disabled && (
                              <button
                                title="Edit"
                                onClick={() => handleEdit(u.id)}
                                className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              title="Delete"
                              onClick={() => handleDelete(u.id, u.unit_name)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredUnits.length > 0 && (
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstUnit + 1}-{Math.min(indexOfLastUnit, filteredUnits.length)} of{' '}
                <span className="font-semibold">{filteredUnits.length}</span> units
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 text-[#5CAAAB] hover:bg-[#5CAAAB] hover:text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ◀
                </button>
                
                {[...Array(Math.ceil(filteredUnits.length / unitsPerPage))].map((_, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1 rounded transition-colors ${
                      currentPage === index + 1
                        ? 'bg-[#5CAAAB] text-white'
                        : 'text-[#5CAAAB] hover:bg-[#5CAAAB] hover:text-white'
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  className="px-3 py-1 text-[#5CAAAB] hover:bg-[#5CAAAB] hover:text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredUnits.length / unitsPerPage)}
                >
                  ▶
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UnitDetails;