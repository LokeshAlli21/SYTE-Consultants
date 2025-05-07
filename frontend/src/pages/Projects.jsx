import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import databaseService from "../backend-services/database/database";

const ProjectsPage = () => {
  const navigate = useNavigate();

  const handleNewProjectClick = () => {
    navigate('/projects/add');
  };

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ district: '', city: '' });

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await databaseService.getAllProjects();
        console.log(data);
        
        setProjects(data);
      } catch (error) {
        toast.error("❌ Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === projects.length ? [] : projects.map((p) => p.id)
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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const filteredProjects = projects
  .filter(p => {
    const matchesSearch =
      p.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.promoter_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rera_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDistrict = filters.district
      ? p.district?.toLowerCase() === filters.district.toLowerCase()
      : true;

    const matchesCity = filters.city
      ? p.city?.toLowerCase() === filters.city.toLowerCase()
      : true;

    return matchesSearch && matchesDistrict && matchesCity;
  });

  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete project "${name}"?`);
    if (!confirmDelete) return;

    try {
      await databaseService.deleteProjectById(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      toast.success(`✅ Project "${name}" deleted successfully.`);
    } catch (error) {
      toast.error("❌ Failed to delete project.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/projects/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/projects/view/${id}`);
  };

  return (
    <div className="p-8 pt-3">
      <div className="flex items-center justify-between mb-6 pl-6">
        <h1 className="text-[24px] font-bold text-[#2F4C92]">Projects</h1>
        <div className="w-10 h-10 bg-[#C2C2FF] rounded-full"></div>
      </div>

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
            <span className="absolute top-2.5 left-3 text-gray-400"><FaSearch /></span>
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
          onClick={handleNewProjectClick}
          className="ml-auto flex items-center gap-2 bg-[#5CAAAB] text-white px-6 py-2 rounded-full font-medium transition hover:bg-[#489090] shadow-sm"
        >
          <FaPlus /> New Project
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto px-0 py-6">
        <div className="flex mx-6 items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Project List</h2>
          <span className="text-sm text-gray-500">
            {filteredProjects.length} projects found
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400 animate-pulse">
            Fetching project data...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            No project data available.
          </div>
        ) : (
          <table className="w-full table-auto border-collapse text-sm">
  <thead className="bg-gray-50">
    <tr className="text-left text-gray-600 font-semibold">
      <th className="p-3 w-12">
        <input
          type="checkbox"
          onChange={toggleSelectAll}
          checked={selectedIds.length === filteredProjects.length}
          className="accent-blue-600"
        />
      </th>
      <th className="p-3">Sr No.</th>
      <th className="p-3">Project Name</th>
      <th className="p-3">Promoter Name</th>
      <th className="p-3">RERA Number</th>
      <th className="p-3">District</th>
      <th className="p-3">City</th>
      <th className="p-3">Registration Date</th>
      <th className="p-3">Expiry Date</th>
      <th className="p-3 text-center">Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredProjects.map((p, idx) => {
      const selected = selectedIds.includes(p.id);
      return (
        <tr
          key={p.id}
          className={`transition border-gray-200 border-b-2 duration-150 ease-in-out ${selected ? "bg-blue-50" : "hover:bg-gray-50"}`}
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
          <td className="p-3 font-medium text-gray-900">{p.project_name}</td>
          <td className="p-3">{p.promoter_name}</td>
          <td className="p-3">{p.rera_number}</td>
          <td className="p-3">{p.district}</td>
          <td className="p-3">{p.city}</td>
          <td className="p-3">{p.registration_date}</td>
          <td className="p-3">{p.expiry_date}</td>
          <td className="p-3">
            <div className="flex items-center justify-center gap-3 text-[15px]">
              <button title="View" onClick={() => handleView(p.id)} className="text-blue-400 hover:text-blue-800">
                <FaEye />
              </button>
              <button title="Edit" onClick={() => handleEdit(p.id)} className="text-yellow-500 hover:text-yellow-600">
                <FaEdit />
              </button>
              <button title="Delete" onClick={() => handleDelete(p.id, p.project_name)} className="text-red-400 hover:text-red-600">
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
            Showing {indexOfFirstProject + 1}-{Math.min(indexOfLastProject, projects.length)} from <b>{projects.length}</b> data
          </span>
          <div className="flex items-center gap-2">
            <button
              className="text-[#5CAAAB]"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ◀
            </button>
            {[...Array(Math.ceil(projects.length / projectsPerPage))].map((_, index) => (
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
              disabled={currentPage === Math.ceil(projects.length / projectsPerPage)}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
