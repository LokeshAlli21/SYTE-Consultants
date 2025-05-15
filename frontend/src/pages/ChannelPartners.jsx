import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import databaseService from "../backend-services/database/database";
import Select from "react-select";
import { IoClose } from "react-icons/io5"

const ChannelPartners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ district: '', city: '' });

      const [districtOptions, setDistrictOptions] = useState([]);
      const [cityOptions, setCityOptions] = useState([]);
      const [districtCityMap, setDistrictCityMap] = useState({})
      
      useEffect(() => {
        async function fetchCitiesAndDistricts() {
          try {
            const {districtOptions, districtCityMap } =
              await databaseService.getAllCitiesAndDistricts(); // Make sure this returns data
            setDistrictCityMap(districtCityMap)
            setDistrictOptions(districtOptions);
          } catch (error) {
            console.error("Error fetching cities and districts:", error);
          }
        }
    
        fetchCitiesAndDistricts();
      }, []);
    
      useEffect(() => {
        // console.log(filters);
        
        if (filters.district) {
          setCityOptions(districtCityMap[filters.district] || []);
          // console.log(districtCityMap[formData.district]|| []);
          
        }
      }, [filters.district]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await databaseService.getAllChannelPartners();
        console.log(data);
        
        setPartners(data);
      } catch (error) {
        toast.error("❌ Failed to load channel partners");
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const filteredPartners = partners.filter(p => {
    const query = searchQuery.toLowerCase();
  
    const matchesSearch =
      p.name?.toLowerCase().includes(query) ||
      p.contact_number?.toLowerCase().includes(query) ||
      p.alternate_number?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query) ||
      p.district?.toLowerCase().includes(query) ||
      p.city?.toLowerCase().includes(query) ||
      query === '';
  
    const matchesDistrict = filters.district === '' || p.district?.toLowerCase() === filters.district.toLowerCase();
    const matchesCity = filters.city === '' || p.city?.toLowerCase() === filters.city.toLowerCase();
  
    return matchesSearch && matchesDistrict && matchesCity;
  });
  

  const handleAdd = () => navigate('/channel-partners/add');
  const handleView = (id) =>  navigate(`/channel-partners/view/${id}`);
  const handleEdit = (id) => navigate(`/channel-partners/edit/${id}`);
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true)
    try {
      await databaseService.deleteChannelPartnerById(id);
      setPartners(prev => prev.filter(p => p.id !== id));
      toast.success("✅ Deleted successfully");
    } catch (err) {
      toast.error("❌ Deletion failed");
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="p-8 pt-3">
      <div className="flex items-center justify-between mb-6 pl-6">
        <h1 className="text-[24px] font-bold text-[#2F4C92]">Channel Partners</h1>
        <div className="w-10 h-10 bg-[#C2C2FF] rounded-full" />
      </div>
      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex flex-1 items-center flex-wrap gap-4">
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
          <div className="flex flex-col w-[200px] ">
            <Select
              isClearable
              options={districtOptions} // This should be the array of districts
              value={districtOptions.find((opt) => opt.value === filters.district)}
              onChange={(selectedOption) => {
                setFilters({
                  ...filters,
                  district: selectedOption ? selectedOption.value : "",
                });
                setCurrentPage(1);
              }}
              isSearchable={true}
              placeholder="Select a district"
              styles={{
                control: (base, state) => ({
                  ...base,
                  padding: "6px",
                  minHeight: "44px",
                  borderRadius: "calc(infinity * 1px)",
                  borderColor: state.isFocused ? "#5caaab" : "#d1d5db",
                  boxShadow: state.isFocused ? "0 0 0 3px #5caaab55" : "none",
                  transition:
                    "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    borderColor: "#5caaab",
                  },
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
                  color: state.isSelected ? "white" : "#1f2937", // dark gray text
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                  fontWeight: state.isSelected ? 600 : 400,
                  cursor: "pointer",
                  transition: "background-color 0.2s ease-in-out",
                }),

                placeholder: (base) => ({
                  ...base,
                  color: "#9ca3af", // tailwind gray-400
                  fontSize: "0.95rem",
                }),

                singleValue: (base) => ({
                  ...base,
                  color: "#374151", // tailwind gray-700
                  fontWeight: 500,
                }),
              }}
            />
          </div>

          <div className="flex flex-col w-[200px]">
            <Select
              isClearable
              options={cityOptions} // This should be the array of cities
              value={cityOptions.find((opt) => opt.value === filters.city)}
              onChange={(selectedOption) => {
                setFilters({
                  ...filters,
                  city: selectedOption ? selectedOption.value : "",
                });
                setCurrentPage(1);
              }}
              isSearchable={true}
              isDisabled={cityOptions.length < 1}
              placeholder="Select a city"
              styles={{
                control: (base, state) => ({
                  ...base,
                  padding: "6px",
                  minHeight: "44px",
                  borderRadius: "calc(infinity * 1px)",
                  borderColor: state.isFocused ? "#5caaab" : "#d1d5db",
                  boxShadow: state.isFocused ? "0 0 0 3px #5caaab55" : "none",
                  transition:
                    "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    borderColor: "#5caaab",
                  },
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
                  color: state.isSelected ? "white" : "#1f2937", // dark gray text
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                  fontWeight: state.isSelected ? 600 : 400,
                  cursor: "pointer",
                  transition: "background-color 0.2s ease-in-out",
                }),

                placeholder: (base) => ({
                  ...base,
                  color: "#9ca3af", // tailwind gray-400
                  fontSize: "0.95rem",
                }),

                singleValue: (base) => ({
                  ...base,
                  color: "#374151", // tailwind gray-700
                  fontWeight: 500,
                }),
              }}
            />
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="ml-auto flex items-center gap-2 bg-[#5CAAAB] text-white px-5 py-3 rounded-full font-semibold text-md shadow-md transition-all duration-200 hover:bg-[#489090] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#5CAAAB]"
        >
          <FaPlus className="text-base" />
          New Channel Partner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
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
              <tr><td colSpan="8" className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : filteredPartners.length === 0 ? (
              <tr><td colSpan="8" className="p-6 text-center text-gray-500">No data found</td></tr>
            ) : (
              filteredPartners.map((p, idx) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{p.full_name}</td>
                  <td className="p-3">{p.contact_number}</td>
                  <td className="p-3">{p.alternate_contact_number}</td>
                  <td className="p-3">{p.email_id}</td>
                  <td className="p-3">{p.district}</td>
                  <td className="p-3">{p.city}</td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-center text-lg">
                      <button onClick={() => handleView(p.id)} className="text-blue-500 hover:text-blue-700"><FaEye /></button>
                      <button onClick={() => handleEdit(p.id)} className="text-yellow-500 hover:text-yellow-600"><FaEdit /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChannelPartners;
