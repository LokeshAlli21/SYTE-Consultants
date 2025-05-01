import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBell,
  FaRegCircleUser,
  FaPlus,
} from "react-icons/fa6";
import { FaSearch,FaWhatsapp  } from "react-icons/fa";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { toast } from "react-toastify";
import databaseService from "../backend-services/database/database";

const PromotersPage = () => {
  const navigate = useNavigate();

  const [promoters, setPromoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const promotersPerPage = 5;
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ district: "", city: "" });

  const fetchPromoters = async () => {
    try {
      const data = await databaseService.getAllPromoters();
      setPromoters(data);
    } catch (error) {
      toast.error("❌ Failed to load promoters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoters();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPromoters.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPromoters.map((p) => p.id));
    }
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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleNewPromoterClick = () => {
    navigate("/promoters/add");
  };

  const handleEdit = (id) => navigate(`/promoters/edit/${id}`);
  const handleView = (id) => console.log(`handleView: ${id}`);
  const handleMail = (id) => console.log(`handleMail: ${id}`);
  const handleWhatsapp = (id) => console.log(`handleWhatsapp: ${id}`);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await databaseService.deletePromoterById(id);
      setPromoters((prev) => prev.filter((p) => p.id !== id));
      toast.success(`✅ "${name}" deleted.`);
    } catch (error) {
      toast.error("❌ Failed to delete promoter.");
    }
  };

  const filteredPromoters = promoters
    .filter((p) =>
      p.promoter_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((p) =>
      p.district.toLowerCase().includes(filters.district.toLowerCase())
    )
    .filter((p) =>
      p.city.toLowerCase().includes(filters.city.toLowerCase())
    );

  const indexOfLast = currentPage * promotersPerPage;
  const indexOfFirst = indexOfLast - promotersPerPage;
  const currentPromoters = filteredPromoters.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPromoters.length / promotersPerPage);

  return (
    <div className="p-8 pt-3">
      <div className="flex items-center justify-between mb-6 pl-6">
        <h1 className="text-[24px] font-bold text-[#2F4C92]">Promoters</h1>
        <div className="w-10 h-10 bg-[#C2C2FF] rounded-full" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-white rounded-full outline-0 px-4 py-2 w-64 pl-10 shadow-sm border border-[#5CAAAB]"
            />
            <span className="absolute top-2.5 left-3 text-gray-400">
              <FaSearch />
            </span>
          </div>
          <select
            name="district"
            value={filters.district}
            onChange={handleFilterChange}
            className="bg-white rounded-full px-4 py-2 shadow-md border-[#5CAAAB]"
          >
            <option value="">Select District</option>
            <option value="district1">District 1</option>
            <option value="district2">District 2</option>
          </select>
          <select
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
            className="bg-white rounded-full px-4 py-2 shadow-md border-[#5CAAAB]"
          >
            <option value="">Select City</option>
            <option value="city1">City 1</option>
            <option value="city2">City 2</option>
          </select>
        </div>

        <button
          onClick={handleNewPromoterClick}
          className="ml-auto flex items-center gap-2 bg-[#5CAAAB] text-white px-6 py-2 rounded-full font-medium transition hover:bg-[#489090] shadow-sm"
        >
          <FaPlus /> New Promoter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto px-0 py-6">
        <div className="flex mx-6 items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Promoter List</h2>
          <span className="text-sm text-gray-500">
            {filteredPromoters.length} promoters found
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400 animate-pulse">
            Fetching promoter data...
          </div>
        ) : currentPromoters.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            No promoter data available.
          </div>
        ) : (
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600 font-semibold">
                <th className="p-3 w-12">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      selectedIds.length === currentPromoters.length &&
                      currentPromoters.length !== 0
                    }
                    className="accent-blue-600"
                  />
                </th>
                <th className="p-3">Sr No.</th>
                <th className="p-3">Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Email</th>
                <th className="p-3">District</th>
                <th className="p-3">City</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPromoters.map((p, idx) => {
                const selected = selectedIds.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`transition border-b-2 border-gray-200 ${
                      selected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelect(p.id)}
                        className="accent-blue-600"
                      />
                    </td>
                    <td className="p-3">{p.id}</td>
                    <td className="p-3 font-medium text-gray-900">
                      {p.promoter_name}
                    </td>
                    <td className="p-3">{p.contact_number}</td>
                    <td className="p-3">{p.email_id}</td>
                    <td className="p-3">{p.district}</td>
                    <td className="p-3">{p.city}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-3 text-[15px]">
                        <button
                          title="View"
                          onClick={() => handleView(p.id)}
                          className="text-blue-400 hover:text-blue-800"
                        >
                          <FaEye />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => handleEdit(p.id)}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          title="Whatsapp"
                          onClick={() => handleWhatsapp(p.id)}
                          className="text-green-500 hover:text-green-700"
                        >
                          <FaWhatsapp />
                        </button>
                        <button
                          title="Mail"
                          onClick={() => handleMail(p.id)}
                          className="text-gray-500 hover:text-gray-600"
                        >
                          <IoMail />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(p.id, p.promoter_name)}
                          className="text-red-400 hover:text-red-600"
                        >
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

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-2 text-sm text-gray-600">
          <span>
            Showing {indexOfFirst + 1}-{Math.min(indexOfLast, filteredPromoters.length)} of{" "}
            <b>{filteredPromoters.length}</b>
          </span>
          <div className="flex items-center gap-2">
            <button
              className="text-[#5CAAAB]"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ◀
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-full border ${
                  currentPage === i + 1
                    ? "bg-[#5CAAAB] text-white"
                    : "text-[#5CAAAB]"
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="text-[#5CAAAB]"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotersPage;
