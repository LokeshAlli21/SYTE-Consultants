import { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import databaseService from "../backend-services/database/database";

const PromoterTable = () => {
  const [promoters, setPromoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
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
    fetchPromoters();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === promoters.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(promoters.map((p) => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-x-auto px-0 py-6">
      <div className="flex mx-6 items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Promoter List</h2>
        <span className="text-sm text-gray-500">
          {promoters.length} promoters found
        </span>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-400 animate-pulse">
          Fetching promoter data...
        </div>
      ) : promoters.length === 0 ? (
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
                  checked={selectedIds.length === promoters.length}
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
            {promoters.map((p, idx) => {
              const selected = selectedIds.includes(p.id);
              return (
                <tr
                  key={p.id}
                  className={`transition border-gray-200  border-b-2 duration-150 ease-in-out ${
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
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3 font-medium text-gray-900">{p.promoter_name}</td>
                  <td className="p-3">{p.contact_number}</td>
                  <td className="p-3">{p.email_id}</td>
                  <td className="p-3">{p.district}</td>
                  <td className="p-3">{p.city}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3 text-[15px]">
                      <button title="View" className="text-blue-400 hover:text-blue-800">
                        <FaEye />
                      </button>
                      <button title="Edit" className="text-yellow-500 hover:text-yellow-600">
                        <FaEdit />
                      </button>
                      <button title="Delete" className="text-red-400 hover:text-red-600">
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
    </div>
  );
};

export default PromoterTable;
