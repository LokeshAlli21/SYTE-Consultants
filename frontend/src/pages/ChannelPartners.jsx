import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import databaseService from "../backend-services/database/database";

const ChannelPartners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ district: '', city: '' });

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await databaseService.getAllChannelPartners();
        // console.log(data);
        
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

  const filteredPartners = partners.filter(p => p
    // p.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    // p.district?.toLowerCase().includes(filters.district.toLowerCase()) &&
    // p.city?.toLowerCase().includes(filters.city.toLowerCase())
  );

  const handleAdd = () => navigate('/channel-partners/add');
  const handleView = (id) => console.log("View", id);
  const handleEdit = (id) => navigate(`/channel-partners/edit/${id}`);
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await databaseService.deleteChannelPartnerById(id);
      setPartners(prev => prev.filter(p => p.id !== id));
      toast.success("✅ Deleted successfully");
    } catch (err) {
      toast.error("❌ Deletion failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#2F4C92]">Channel Partners</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#5CAAAB] text-white px-4 py-2 rounded-full shadow hover:bg-[#489090]"
        >
          <FaPlus /> New Partner
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-white pl-10 pr-4 py-2 rounded-full shadow border border-[#5CAAAB]"
          />
          <span className="absolute top-2.5 left-3 text-gray-400"><FaSearch /></span>
        </div>
        <select name="district" onChange={handleFilterChange} className="rounded-full px-4 py-2 border border-[#5CAAAB]">
          <option value="">District</option>
          <option value="District 1">District 1</option>
          <option value="District 2">District 2</option>
        </select>
        <select name="city" onChange={handleFilterChange} className="rounded-full px-4 py-2 border border-[#5CAAAB]">
          <option value="">City</option>
          <option value="City 1">City 1</option>
          <option value="City 2">City 2</option>
        </select>
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
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.contact_number}</td>
                  <td className="p-3">{p.alternate_number}</td>
                  <td className="p-3">{p.email}</td>
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
