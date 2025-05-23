import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import databaseService from "../backend-services/database/database";
import Select from "react-select";
import { IoClose } from "react-icons/io5";

const ChannelPartners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ district: '', city: '' });
  const [districtOptions, setDistrictOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [districtCityMap, setDistrictCityMap] = useState({});
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [partnersPerPage] = useState(10);
  
  // Fetch cities and districts on component mount
  useEffect(() => {
    async function fetchCitiesAndDistricts() {
      try {
        const { districtOptions, districtCityMap } = await databaseService.getAllCitiesAndDistricts();
        setDistrictCityMap(districtCityMap);
        setDistrictOptions(districtOptions);
      } catch (error) {
        console.error("Error fetching cities and districts:", error);
        toast.error("Failed to load location data");
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

  // Fetch channel partners data
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const data = await databaseService.getAllChannelPartners();
        setPartners(data);
      } catch (error) {
        console.error("Error fetching partners:", error);
        toast.error("❌ Failed to load channel partners");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPartners();
  }, []);

  // Handle search and filters
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ district: '', city: '' });
    setCurrentPage(1);
  };

  // Filter partners based on search and filter criteria
  const filteredPartners = partners.filter(p => {
    const query = searchQuery.toLowerCase();
    
    const matchesSearch =
      p.full_name?.toLowerCase().includes(query) ||
      p.contact_number?.toLowerCase().includes(query) ||
      p.alternate_contact_number?.toLowerCase().includes(query) ||
      p.email_id?.toLowerCase().includes(query) ||
      p.district?.toLowerCase().includes(query) ||
      p.city?.toLowerCase().includes(query) ||
      query === '';
    
    const matchesDistrict = !filters.district || p.district?.toLowerCase() === filters.district.toLowerCase();
    const matchesCity = !filters.city || p.city?.toLowerCase() === filters.city.toLowerCase();
    
    return matchesSearch && matchesDistrict && matchesCity;
  });
  
  // Pagination logic
  const indexOfLastPartner = currentPage * partnersPerPage;
  const indexOfFirstPartner = indexOfLastPartner - partnersPerPage;
  const currentPartners = filteredPartners.slice(indexOfFirstPartner, indexOfLastPartner);
  const totalPages = Math.ceil(filteredPartners.length / partnersPerPage);
  
  // CRUD operations
  const handleAdd = () => navigate('/channel-partners/add');
  const handleView = (id) => navigate(`/channel-partners/view/${id}`);
  const handleEdit = (id) => navigate(`/channel-partners/edit/${id}`);
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this channel partner?")) return;
    
    try {
      setLoading(true);
      await databaseService.deleteChannelPartnerById(id);
      setPartners(prev => prev.filter(p => p.id !== id));
      toast.success("✅ Deleted successfully");
      
      // Adjust current page if needed after deletion
      if (currentPartners.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error("Error deleting partner:", err);
      toast.error("❌ Deletion failed");
    } finally {
      setLoading(false);
    }
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  // Custom select styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      padding: "6px",
      minHeight: "44px",
      borderRadius: "9999px",
      borderColor: "transparent",
      boxShadow: state.isFocused ? "0 0 0 3px #5caaab55" : "none",
      transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": { borderColor: "#5caaab" },
      backgroundColor: "white",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.75rem",
      zIndex: 50,
      marginTop: "4px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#5caaab"
        : state.isFocused
        ? "#5caaab22"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      padding: "10px 14px",
      fontSize: "0.95rem",
      fontWeight: state.isSelected ? 600 : 400,
      cursor: "pointer",
      transition: "background-color 0.2s ease-in-out",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
      fontSize: "0.95rem",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#374151",
      fontWeight: 500,
    }),
  };

  return (
    <div className="p-8 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pl-6">
        <h1 className="text-[24px] font-bold text-[#2F4C92]">Channel Partners</h1>
        <div className="w-10 h-10 bg-[#C2C2FF] rounded-full" />
      </div>
      
      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex flex-1 items-center flex-wrap gap-4">
          {/* Search Input */}
          <div className="relative w-full max-w-sm rounded-full shadow-md">
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
                onClick={handleClearSearch}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
              >
                <IoClose className="text-2xl" />
              </button>
            )}
          </div>
          
          {/* District Filter */}
          <div className="flex flex-col w-[200px] shadow-md rounded-full">
            <Select
              isClearable
              options={districtOptions}
              value={districtOptions.find((opt) => opt.value === filters.district)}
              onChange={(selectedOption) => {
                setFilters({
                  ...filters,
                  district: selectedOption ? selectedOption.value : "",
                  city: "", // Reset city when district changes
                });
                setCurrentPage(1);
              }}
              isSearchable={true}
              placeholder="Select a district"
              styles={selectStyles}
            />
          </div>

          {/* City Filter */}
          <div className="flex flex-col w-[200px] shadow-md rounded-full">
            <Select
              isClearable
              options={cityOptions}
              value={cityOptions.find((opt) => opt.value === filters.city)}
              onChange={(selectedOption) => {
                setFilters({
                  ...filters,
                  city: selectedOption ? selectedOption.value : "",
                });
                setCurrentPage(1);
              }}
              isSearchable={true}
              isDisabled={!filters.district || cityOptions.length < 1}
              placeholder="Select a city"
              styles={selectStyles}
            />
          </div>
          
          {/* Clear Filters Button */}
          {(filters.district || filters.city) && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors duration-200"
            >
              <IoClose className="text-base" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Add New Button */}
        <button
          onClick={handleAdd}
          className="ml-auto flex items-center gap-2 bg-[#5CAAAB] text-white px-5 py-3 rounded-full font-semibold text-md shadow-xl transition-all duration-200 hover:bg-[#489090] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#5CAAAB]"
        >
          <FaPlus className="text-base" />
          New Channel Partner
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col">
          <span className="text-gray-500 text-sm">Total Partners</span>
          <span className="text-2xl font-bold text-[#2F4C92]">{partners.length}</span>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col">
          <span className="text-gray-500 text-sm">Active Filters</span>
          <span className="text-2xl font-bold text-[#5CAAAB]">
            {(filters.district ? 1 : 0) + (filters.city ? 1 : 0) + (searchQuery ? 1 : 0)}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col">
          <span className="text-gray-500 text-sm">Filtered Results</span>
          <span className="text-2xl font-bold text-[#5CAAAB]">{filteredPartners.length}</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold">
            <tr>
              <th className="p-3">Sr No</th>
              <th className="p-3">Channel Partner Name</th>
              <th className="p-3">Contact Number</th>
              <th className="p-3">Alternate Number</th>
              <th className="p-3">Email ID</th>
              <th className="p-3">District</th>
              <th className="p-3">City</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-6 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-[#5CAAAB] animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-4 h-4 rounded-full bg-[#5CAAAB] animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-4 h-4 rounded-full bg-[#5CAAAB] animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </td>
              </tr>
            ) : currentPartners.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  {filteredPartners.length === 0 && partners.length > 0 ? 
                    "No results match your search criteria" : 
                    "No channel partners found"}
                </td>
              </tr>
            ) : (
              currentPartners.map((p, idx) => (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors duration-150">
                  <td className="p-3">{indexOfFirstPartner + idx + 1}</td>
                  <td className="p-3 font-medium">{p.full_name ?? 'NA'}</td>
                  <td className="p-3">{p.contact_number ?? 'NA'}</td>
                  <td className="p-3">{p.alternate_contact_number ?? 'NA'}</td>
                  <td className="p-3">{p.email_id ?? 'NA'}</td>
                  <td className="p-3">{p.district ?? 'NA'}</td>
                  <td className="p-3">{p.city ?? 'NA'}</td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-center text-lg">
                      <button 
                        onClick={() => handleView(p.id)} 
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => handleEdit(p.id)} 
                        className="text-yellow-500 hover:text-yellow-600 transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {!loading && filteredPartners.length > 0 && (
          <div className="flex justify-between items-center mt-4 px-2">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstPartner + 1} to {Math.min(indexOfLastPartner, filteredPartners.length)} of {filteredPartners.length} entries
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Prev
              </button>
              
              {pageNumbers.map(number => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`px-3 py-1 rounded ${
                    currentPage === number
                      ? "bg-[#5CAAAB] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages || totalPages === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelPartners;