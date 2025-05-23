import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import databaseService from '../../backend-services/database/database';
import {UnitDetailsForm} from '../index.js';
import { IoClose } from "react-icons/io5"

function UnitDetails({disabled, projectId , setIsUnitDetailsFormActive, isUnitDetailsFormActive,formData,setFormData,handleSubmitProjectUnit, handleUpdateProjectUnit}) {

  const [isDisabled, setIsDesabled] = useState(false)
  
  const [currentUnitId, setCurrentUnitId] = useState(null)

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [unitsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const indexOfLastUnit = currentPage * unitsPerPage;
  const indexOfFirstUnit = indexOfLastUnit - unitsPerPage;
  const currentUnits = units.slice(indexOfFirstUnit, indexOfLastUnit);

  useEffect(() => {
    if(isUnitDetailsFormActive){
      return
    }
    const fetchUnits = async () => {
      if(projectId){
      try {
        const data = await databaseService.getAllUnitsForProject(projectId);
        console.log(data);
        
        setUnits(data);
      } catch (error) {
        toast.error("❌ Failed to load unit details");
      } finally {
        setLoading(false);
      }
    }
    };
    fetchUnits();
    setFormData(resetObjectData(formData))
  }, [isUnitDetailsFormActive]);

  function resetObjectData(obj) {
    if (Array.isArray(obj)) return [];
    
  
    const clearedObj = {};
  
    for (const key in obj) {
      const value = obj[key];
  
      // Skip resetting 'project_id'
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
        clearedObj[key] = resetObjectData(value); // recursively clear nested objects
      } else {
        clearedObj[key] = value; // keep other types as-is (like null, undefined)
      }
    }
  
    return clearedObj;
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === units.length ? [] : units.map((u) => u.id)
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

  const filteredUnits = currentUnits.filter((u) =>
    u.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.unit_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete unit "${name}"?`);
    if (!confirmDelete) return;
  
    try {
      await databaseService.deleteProjectUnitById(id);
      setUnits(prev => prev.filter(unit => unit.id !== id));
      toast.success(`✅ Unit "${name}" deleted successfully.`);
    } catch (error) {
      toast.error("❌ Failed to delete unit.");
    }
  };  

  const handleEdit = async (id) => {
    try {
      setIsDesabled(false); // Enable fields for editing
      
      const unit = await databaseService.getUnitById(id);
      
      if (unit) {
        setFormData(unit); 
        setCurrentUnitId(id)
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
      setIsDesabled(true); // Disable fields for view-only
      const unit = await databaseService.getUnitById(id);
      
      if (unit) {
        setFormData(unit); // Assuming you have a state to hold selected unit
        setIsUnitDetailsFormActive(true);
      } else {
        toast.error("❌ Unit not found");
      }
    } catch (error) {
      console.error("❌ Error fetching unit for view:", error);
      toast.error("❌ Failed to load unit for viewing.");
    }
  };
  

  if(!projectId){
    return
  }

  return isUnitDetailsFormActive? (
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
  )
  :
  (
    <div className="p-0 pt-3">
      <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2.5 rounded-full border border-[#5CAAAB] font-medium text-zinc-500 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5CAAAB] transition duration-200"
            />

            {/* Search Icon */}
            <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#5CAAAB] text-base" />

            {/* Clear (X) Icon - shown only when input has value */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange({ target: { value: "" } })}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
              >
                <IoClose className="text-2xl" />
              </button>
            )}
          </div>
        {!disabled &&
           <button
                  onClick={() => setIsUnitDetailsFormActive(true)}
                  className="ml-auto flex items-center gap-2 bg-[#5CAAAB] text-white px-5 py-3 rounded-full font-semibold text-md shadow-md transition-all duration-200 hover:bg-[#489090] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#5CAAAB]"
                >
                  <FaPlus className="text-base" />
                  New Assignment
                </button>
        }
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto px-0 py-6">
        <div className="flex mx-6 items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Unit List</h2>
          <span className="text-sm text-gray-500">
            {filteredUnits.length} units found
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400 animate-pulse">
            Fetching unit data...
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            No unit data available.
          </div>
        ) : (
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600 font-semibold">
                <th className="p-3 w-12">
                  <input
disabled={disabled}
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={selectedIds.length === filteredUnits.length}
                    className="accent-blue-600"
                  />
                </th>
                <th className="p-3">Sr No.</th>
                <th className="p-3">Unit Name</th>
                <th className="p-3">Unit Type</th>
                <th className="p-3">Carpet Area</th>
                <th className="p-3">Unit Status</th>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Agreement Value</th>
                <th className="p-3">Total Received</th>
                <th className="p-3">Balance Amount</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map((u, idx) => {
                const selected = selectedIds.includes(u.id);
                return (
                  <tr
                    key={u.id}
                    className={`transition border-gray-200 border-b-2 duration-150 ease-in-out ${selected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="p-3">
                      <input
disabled={disabled}
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelect(u.id)}
                        className="accent-blue-600"
                      />
                    </td>
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3 font-medium text-gray-900">{(u.unit_name)? u.unit_name : 'NA'}</td>
                    <td className="p-3">{(u.unit_type)? u.unit_type : 'NA'}</td>
                    <td className="p-3">{(u.carpet_area)? u.carpet_area : 'NA'}</td>
                    <td className="p-3">{(u.unit_status)? u.unit_status : 'NA'}</td>
                    <td className="p-3">{(u.customer_name)? u.customer_name : 'NA'}</td>
                    <td className="p-3">{(u.agreement_value)? u.agreement_value : 'NA'}</td>
                    <td className="p-3">{(u.total_received)? u.total_received : 'NA'}</td>
                    <td className="p-3">{(u.balance_amount)? u.balance_amount : 'NA'}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-3 text-[15px]">
                        <button title="View" onClick={() => handleView(u.id)} className="text-blue-400 hover:text-blue-800">
                          <FaEye />
                        </button>
                        { !disabled &&
                        <button title="Edit" onClick={() => handleEdit(u.id)} className="text-yellow-500 hover:text-yellow-600">
                          <FaEdit />
                        </button>
                        }
                        <button title="Delete" onClick={() => handleDelete(u.id, u.unit_name)} className="text-red-400 hover:text-red-600">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="flex justify-between items-center mt-4 px-2 text-sm text-gray-600">
          <span>
            Showing {indexOfFirstUnit + 1}-{Math.min(indexOfLastUnit, units.length)} from <b>{units.length}</b> units
          </span>
          <div className="flex items-center gap-2">
            <button
              className="text-[#5CAAAB]"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ◀
            </button>
            {[...Array(Math.ceil(units.length / unitsPerPage))].map((_, index) => (
              <button
                key={index}
                className={`w-8 h-8 rounded-full border ${
                  currentPage === index + 1 ? 'bg-[#5CAAAB] text-white' : 'text-[#5CAAAB]'
                }`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="text-[#5CAAAB]"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(units.length / unitsPerPage)}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnitDetails;
