import React, { useState, useEffect, useCallback, use } from 'react';
import { 
  FaUsers, 
  FaUserShield, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaDownload,
  FaEye,
  FaTimes,
  FaTimes as FaTimesCircle,
  FaKey,
  FaBan,
  FaUnlock,
  FaUserCheck,
  FaUserTimes,
  FaHistory,
  FaCog,
  FaChevronDown,
  FaSortUp,
  FaSortDown,
  FaSort,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaUserTag,
  FaCheck,
  FaShieldAlt,
  FaEyeSlash,
  FaUndo ,
} from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import { MdAdminPanelSettings, MdVerified, MdBlock, MdSecurity } from 'react-icons/md';
import { BiRefresh, BiExport } from 'react-icons/bi';
import { IoMdTime } from 'react-icons/io';
import databaseService from "../backend-services/database/database"; // Corrected import path
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';
import FileInputWithPreview from "../components/forms/FileInputWithPreview "; // Assuming you have a component for file input with preview

function AdminPanel() {

  const userData = useSelector((state) => state.auth.userData);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [bulkActionType, setBulkActionType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [stats, setStats] = useState({});
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });


  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Form data for create/edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    password: '',
    photo_url: '',
  });

  
    const [filePreviews, setFilePreviews] = useState({});

      const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => ({
          ...prev,
          [name]: { url: reader.result, type: file.type },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

    const handleFileDelete = (name) => {
    setFormData((prev) => ({ ...prev, [name]: null }));

    setFilePreviews((prev) => {
      const updatedPreviews = { ...prev };
      delete updatedPreviews[name];
      return updatedPreviews;
    });
  };

  // Permission check
  if (userData && userData.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <FaUserShield className="text-red-600 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Administrator privileges required to access this panel.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
useEffect(() => {
  fetchUsers();
  fetchStats();
}, [currentPage, roleFilter, statusFilter, showDeleted]);

const fetchUsers = useCallback(async () => {
  setLoading(true);
  setError('');
  try {
    const options = {
      page: currentPage,
      limit: itemsPerPage,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      includeDeleted: showDeleted
    };
    
    // Filter out undefined values to clean up query params
    const cleanOptions = Object.fromEntries(
      Object.entries(options).filter(([_, value]) => value !== undefined)
    );
    
    const response = await databaseService.getAllUsers(cleanOptions);
    // console.log("Fetched users:", response);
    
    setUsers(response.users || []);
    setTotalUsers(response.total || 0);
  } catch (error) {
    console.error("Error fetching users:", error);
    setError('Failed to fetch users. Please try again.');
    // Reset data on error to prevent stale state
    setUsers([]);
    setTotalUsers(0);
  } finally {
    setLoading(false);
  }
}, [currentPage, itemsPerPage, roleFilter, statusFilter, showDeleted]);

const fetchStats = useCallback(async () => {
  try {
    const statsData = await databaseService.getUserStats();
    // console.log("Fetched stats:", statsData);
    
    setStats(statsData.statistics);
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Optionally set stats to null or empty object on error
    setStats(null);
  }
}, []);

// Search functionality with debouncing and proper state management
const handleSearch = useCallback(async (query) => {
  if (!query.trim()) {
    // Reset to normal fetching when search is cleared
    fetchUsers();
    return;
  }
  
  setLoading(true);
  setError('');
  try {
    const response = await databaseService.searchUsers({
      query: query.trim(),
      page: 1,
      limit: itemsPerPage,
      // Include current filters in search
      role: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      includeDeleted: showDeleted
    });
    setUsers(response.users || []);
    setTotalUsers(response.total || 0);
    setCurrentPage(1);
  } catch (error) {
    console.error("Error searching users:", error);
    setError('Search failed. Please try again.');
    // Reset data on search error
    setUsers([]);
    setTotalUsers(0);
  } finally {
    setLoading(false);
  }
}, [itemsPerPage, roleFilter, statusFilter, showDeleted, fetchUsers]);

// Optional: Add a debounced search function for better UX
const debouncedHandleSearch = useCallback(
  debounce((query) => handleSearch(query), 300),
  [handleSearch]
);

// Update useEffect to use the memoized functions
useEffect(() => {
  fetchUsers();
  fetchStats();
}, [fetchUsers, fetchStats]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      } else {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Sorting and filtering
  const filteredAndSortedUsers = users
    .filter(user => {
      if (!searchTerm) return true;
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'created_at' ) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="opacity-50" />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const resetFormData = useCallback((user = null) => {
    // console.log("Resetting form data with user:", user);
    
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'user',
      status: user?.status || 'active',
      photo_url: user?.photo_url || '',
      password: ''
    });
      const uploadedUrls = {};

      Object.entries(user || {}).forEach(([key, value]) => {
        if (
          typeof key === "string" &&
          key.endsWith("_url") &&
          
          typeof value === "string" &&
          value.startsWith("http")
        ) {
          uploadedUrls[key] = value;
        }
      });

        // console.log("✅ Uploaded URLs:", uploadedUrls);

        if (Object.keys(uploadedUrls).length > 0) {
          setFilePreviews(uploadedUrls);
        }

  }, []);

  const handleUserAction = useCallback((user, action) => {
    setSelectedUser(user);
    resetFormData(user);
    setModalMode(action);
    if (action === 'delete') {
      setUserToDelete(user);
      setShowDeleteModal(true);
    } else {
      setShowUserModal(true);
    }
  }, [resetFormData]);

  const handlePasswordChange = (user) => {
    setSelectedUser(user);
    setPasswordData({
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswordModal(true);
  };

  // Updated block/unblock handler using dedicated API methods
  const handleBlockUser = async (user) => {
    try {
      setLoading(true);
      
      if (user.status === 'blocked') {
        await databaseService.unblockUser(user.id);
        setSuccess('User unblocked successfully');
      } else {
        await databaseService.blockUser(user.id);
        setSuccess('User blocked successfully');
      }
      
      fetchUsers();
      fetchStats(); // Update stats as blocking changes user counts
    } catch (error) {
      console.error('Error updating user block status:', error);
      setError(`Failed to ${user.status === 'blocked' ? 'unblock' : 'block'} user`);
    } finally {
      setLoading(false);
    }
  };

  // Separate handlers for individual block/unblock actions
  const handleBlockUserAction = async (user) => {
    try {
      setLoading(true);
      await databaseService.blockUser(user.id);
      setSuccess('User blocked successfully');
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error blocking user:', error);
      setError('Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUserAction = async (user) => {
    try {
      setLoading(true);
      await databaseService.unblockUser(user.id);
      setSuccess('User unblocked successfully');
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error unblocking user:', error);
      setError('Failed to unblock user');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreUser = async (user) => {
    try {
      setLoading(true);
      await databaseService.restoreUser(user.id);
      setSuccess('User restored successfully');
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error restoring user:', error);
      setError('Failed to restore user');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      setError('Please select users first');
      return;
    }
    setBulkActionType(action);
    setShowBulkActionModal(true);
  };

  // Updated bulk action handler with proper block/unblock methods
  const executeBulkAction = async () => {
    try {
      setLoading(true);
      
      for (const userId of selectedUsers) {
        switch (bulkActionType) {
          case 'block':
            await databaseService.blockUser(userId);
            break;
          case 'unblock':
            await databaseService.unblockUser(userId);
            break;
          case 'delete':
            await databaseService.softDeleteUser(userId);
            break;
          case 'restore':
            await databaseService.restoreUser(userId);
            break;
          default:
            break;
        }
      }
      
      setSuccess(`Bulk ${bulkActionType} completed successfully`);
      setSelectedUsers([]);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error(`Bulk ${bulkActionType} error:`, error);
      setError(`Bulk ${bulkActionType} failed`);
    } finally {
      setLoading(false);
      setShowBulkActionModal(false);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredAndSortedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredAndSortedUsers.map(user => user.id));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (modalMode === 'create' && !formData.password) {
      setError('Password is required for new users');
      return;
    }
    
    try {
      setLoading(true);
      if (modalMode === 'create') {
        await databaseService.createUser(formData);
        setSuccess('User created successfully');
      } else if (modalMode === 'edit') {
        await databaseService.updateUser(selectedUser.id, formData);
        setSuccess('User updated successfully');
      }
      closeModal();
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Form submit error:', error);
      setError('Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    const passwordErrors = validatePassword(passwordData.newPassword);
    if (passwordErrors.length > 0) {
      showToast(`Password must contain: ${passwordErrors.join(', ')}`, 'error');
      return;
    }
    
    try {
      setLoading(true);
      await databaseService.changeUserPassword(selectedUser.id, passwordData.newPassword);
      showToast('Password changed successfully!', 'success');
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: ''});
    } catch (error) {
      console.error('Password change error:', error);
      showToast('Failed to change password. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await databaseService.softDeleteUser(userToDelete.id);
      setSuccess('User deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowUserModal(false);
    setShowPasswordModal(false);
    setPasswordData({ newPassword: '', confirmPassword: ''});
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowBulkActionModal(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
    setUserToDelete(null);
    setError('');
    setSuccess('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active',
      photo_url: '',
      password: ''
    });
    setFilePreviews({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      manager: 'bg-purple-100 text-purple-800 border-purple-200',
      user: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    const icons = {
      admin: <FaShieldAlt className="w-3 h-3 mr-1" />,
      manager: <FaUserShield className="w-3 h-3 mr-1" />,
      user: <FaUsers className="w-3 h-3 mr-1" />
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role] || styles.user} w-fit`}>
        {icons[role]}
        {role?.charAt(0).toUpperCase() + role?.slice(1) || 'User'}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      blocked: 'bg-red-100 text-red-800 border-red-200',
      inactive: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    const icons = {
      active: <FaCheckCircle className="w-3 h-3 mr-1" />,
      blocked: <FaBan className="w-3 h-3 mr-1" />,
      inactive: <IoMdTime className="w-3 h-3 mr-1" />
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.active}`}>
        {icons[status]}
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Active'}
      </span>
    );
  };

  const exportUsers = () => {
    const csvData = users.map(user => ({
      ID: user.id,
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      Role: user.role,
      Status: user.status,
      'Created At': formatDate(user.created_at),
      'Is Deleted': user.is_deleted ? 'Yes' : 'No'
    }));
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFormDataChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePasswordDataChange = useCallback((field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  }, []);

    const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

    const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    return errors;
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 pb-0 px-2">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#5caaab] to-[#4a9a9b] rounded-xl flex items-center justify-center shadow-lg">
                <MdAdminPanelSettings className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Manage users, roles, and system settings</p>
              </div>
            </div>
<div className="flex items-center-safe justify-between gap-4">
  
  {/* Export Button */}
  <button
    onClick={exportUsers}
    className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-[#5caaab] to-[#4a9499] hover:from-[#4a9a9b] hover:to-[#3d8084] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#5caaab]/30"
  >
    <BiExport className="text-lg group-hover:rotate-12 transition-transform duration-300" />
    <span className="font-semibold">Export Users</span>
  </button>

  <div className="flex items-baseline-last space-x-4">
    {/* Welcome Card */}
    <div className="flex items-center space-x-4 px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200  hover:shadow-lg shadow-gray-300/30 transition-all duration-300 group">
      {/* Verified Icon */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
          <MdVerified className="text-green-600 text-xl" />
        </div>
      </div>
      
      {/* Welcome Text */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-green-600 uppercase tracking-wide">
          Welcome Back
        </span>
        <span className="text-lg font-bold text-gray-800">
          {userData?.name || 'User'}
        </span>
      </div>
      
      {/* Profile Photo */}
      {userData?.photo_url && (
        <div className="flex-shrink-0 ml-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-[#5caaab] to-[#4a9499] rounded-2xl shadow-lg ring-4 ring-white/60 hover:ring-white/80 transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer group-hover:shadow-xl group-hover:scale-105">
              <img
                src={userData.photo_url}
                alt={`${userData?.name || 'User'} Profile`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            {/* Online Indicator */}
            {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div> */}
          </div>
        </div>
      )}
      
      {/* Fallback Avatar if no photo */}
      {!userData?.photo_url && (
        <div className="flex-shrink-0 ml-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#5caaab] to-[#4a9499] rounded-2xl shadow-lg ring-4 ring-white/60 hover:ring-white/80 transition-all duration-300 flex items-center justify-center cursor-pointer group-hover:shadow-xl group-hover:scale-105">
            <span className="text-white font-bold text-lg">
              {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      )}
    </div>
  </div>

</div>
          </div>
        </div>
      </div>

{/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            { label: 'Total Users', value: stats.total, icon: FaUsers, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Users', value: stats.active, icon: FaUserCheck, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
            { label: 'Blocked Users', value: stats.blocked, icon: FaUserTimes, color: 'from-red-500 to-red-600', bg: 'bg-red-50' },
            { label: 'Admins', value: stats.admins, icon: FaUserShield, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
            { label: 'Deleted', value: stats.deleted, icon: FaTrash, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50' }
          ].map((stat, index) => (
            <div key={index} className="group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center">
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="text-white text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* User Management Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
          {/* Panel Header */}
              {/* Controls */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
                {/* Search and Filters */}
                <div className="flex flex-1 flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  {/* Search Input */}
<div className="relative flex-1 w-full sm:w-64">
  {/* Search Icon */}
  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />

  {/* Search Input */}
  <input
    type="text"
    placeholder="Search users..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-12 pr-12 py-3 rounded-xl border outline-none border-gray-200 focus:border-[#5CAAAB] focus:ring-2 focus:ring-[#5CAAAB] text-gray-700 placeholder-gray-400 transition-all duration-200 bg-white"
  />

  {/* Clear Button */}
  {searchTerm && (
    <button
      type="button"
      onClick={() => setSearchTerm("")}
      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
    >
      <IoClose size={20} />
    </button>
  )}
</div>

                  
                  {/* Role Filter */}
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5caaab] outline-none focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                  </select>
                  
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5caaab] outline-none focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <label className="flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-300">
                    <input
                      type="checkbox"
                      checked={showDeleted}
                      onChange={(e) => setShowDeleted(e.target.checked)}
                      className="rounded h-4 w-4 border-gray-300 text-blue-600 accent-[#5caaab] focus:ring-[#5caaab] outline-none"
                    />
                    <span>Show Deleted</span>
                  </label>
                  
                  <button
                    onClick={fetchUsers}
                    className="px-6 py-3 text-gray-700 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 border border-gray-300 hover:shadow-md"
                  >
                    <BiRefresh className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                  
                  <button
                    onClick={() => handleUserAction(null, 'create')}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="px-8 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-800">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear selection
                  </button>
                </div>
<div className="flex space-x-2">
  {[
    { action: 'block', label: 'Block Selected', color: 'from-red-100 to-red-200 text-red-800 hover:from-red-200 hover:to-red-300' },
    { action: 'unblock', label: 'Unblock Selected', color: 'from-green-100 to-green-200 text-green-800 hover:from-green-200 hover:to-green-300' },
    { action: 'delete', label: 'Delete Selected', color: 'from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300' },
    { action: 'restore', label: 'Restore Selected', color: 'from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300' }
  ].map((btn) => (
    <button
      key={btn.action}
      onClick={() => handleBulkAction(btn.action)}
      className={`px-4 py-2 text-sm bg-gradient-to-r ${btn.color} rounded-lg transition-all duration-200 font-medium`}
    >
      {btn.label}
    </button>
  ))}
</div>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="px-8 py-4 bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
              <div className="flex items-center space-x-3 text-red-800">
                <FaExclamationTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
                <button onClick={() => setError('')} className="ml-auto">
                  <FaTimes className="w-4 h-4 text-red-600 hover:text-red-800" />
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="px-8 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
              <div className="flex items-center space-x-3 text-green-800">
                <FaCheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{success}</span>
                <button onClick={() => setSuccess('')} className="ml-auto">
                  <FaTimes className="w-4 h-4 text-green-600 hover:text-green-800" />
                </button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-8 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 accent-[#5caaab] focus:ring-[#5caaab] outline-none w-4 h-4"
                    />
                  </th>
                  <th scope="col" className="px-2 py-4 text-left text-xs font-semibold text-gray-600">
                    Sr No.
                  </th>
                  {[
                    { key: 'name', label: 'User' },
                    { key: 'role', label: 'Role' },
                    { key: 'status', label: 'Status' },
                    { key: 'created_at', label: 'Created' }
                  ].map((header) => (
                    <th
                      key={header.key}
                      scope="col"
                      className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
                      onClick={() => handleSort(header.key)}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{header.label}</span>
                        {getSortIcon(header.key)}
                      </div>
                    </th>
                  ))}
                  <th scope="col" className="px-8 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-16 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600 font-medium">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAndSortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <FaUsers className="text-gray-400 text-5xl" />
                        <div>
                          <p className="text-gray-600 font-medium text-lg">No users found</p>
                          <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/50 group transition-colors duration-200">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 text-blue-600 accent-[#5caaab] focus:ring-[#5caaab] outline-none w-4 h-4"
                        />
                      </td>
                      <td className="px-2 py-6 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex flex-col gap-1">
                          <span>{filteredAndSortedUsers.indexOf(user) + 1}</span>
                          <span className="bg-gray-300 rounded px-1 text-xs w-fit">
                            ID:{user.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-3">
                              <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                              {user.is_deleted && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                                  Deleted
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center space-x-2 mt-1">
                              <FaEnvelope className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-600 flex items-center space-x-2 mt-1">
                                <FaPhone className="w-3 h-3" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span>{formatDate(user.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-gray-200/50 hover:shadow-lg transition-all duration-300 group-hover:border-gray-300/60">
                            {/* View */}
                            <button
                              title="View User"
                              onClick={() => handleUserAction(user, 'view')}
                              className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              <FaEye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              title="Edit User"
                              onClick={() => handleUserAction(user, 'edit')}
                              className="p-2.5 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              <FaEdit className="w-3.5 h-3.5" />
                            </button>

                            {/* Conditional Actions */}
                            {user.status_for_delete === 'deleted' ? (
                              <button
                                title="Restore User"
                                onClick={() => handleRestoreUser(user)}
                                className="p-2.5 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                              >
                                <FaUndo className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <>
                                {/* Change Password */}
                                <button
                                  title="Change Password"
                                  onClick={() => handlePasswordChange(user)}
                                  className="p-2.5 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                  <FaKey className="w-3.5 h-3.5" />
                                </button>

                                {/* Block/Unblock */}
                                <button
                                  title={user.status === 'blocked' ? 'Unblock User' : 'Block User'}
                                  onClick={() => handleBlockUser(user)}
                                  className={`p-2.5 rounded-lg text-white hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg ${
                                    user.status === 'blocked'
                                      ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                      : 'bg-gradient-to-br from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600'
                                  }`}
                                >
                                  {user.status === 'blocked' ? (
                                    <FaUnlock className="w-3.5 h-3.5" />
                                  ) : (
                                    <FaBan className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {/* Delete */}
                                <button
                                  title="Delete User"
                                  onClick={() => handleUserAction(user, 'delete')}
                                  className="p-2.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                  <FaTrash className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 font-medium">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white/70 backdrop-blur-sm transition-all duration-200 font-medium"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                            : 'border border-gray-300 hover:bg-gray-50 bg-white/70 backdrop-blur-sm'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white/70 backdrop-blur-sm transition-all duration-200 font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  {modalMode === 'create' ? 'Create New User' : 
                   modalMode === 'edit' ? 'Edit User' : 'User Details'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">

              <div >
                <FileInputWithPreview
                label="User Photo"
                name="photo_url"
                onChange={handleFileChange}
                disabled={modalMode === 'view'}
                className={' w-[150px] h-[150px]'}
                filePreview={filePreviews.photo_url}
                onDelete={() => handleFileDelete("photo_url")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormDataChange('name', e.target.value)}
                  disabled={modalMode === 'view'}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5caaab] outline-none focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormDataChange('email', e.target.value)}
                  disabled={modalMode === 'view'}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5caaab] outline-none focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormDataChange('phone', e.target.value)}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5caaab] outline-none focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleFormDataChange('role', e.target.value)}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5caaab] outline-none focus:border-transparent disabled:bg-gray-50"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFormDataChange('status', e.target.value)}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5caaab] outline-none focus:border-transparent disabled:bg-gray-50"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleFormDataChange('password', e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5caaab] outline-none focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum 8 characters required</p>
                </div>
              )}
              
              {modalMode !== 'view' && (
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-[#5caaab] text-white rounded-lg hover:bg-[#4a9a9b] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : modalMode === 'create' ? 'Create User' : 'Update User'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Password Change Modal */}
{showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#5caaab] to-[#4a9a9b] rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Change Password</h3>
                <button
                  onClick={closeModal}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
              {/* User Info */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  Changing password for: <strong className="text-blue-900">{selectedUser?.name}</strong>
                </p>
              </div>
              
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordDataChange('newPassword', e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5caaab] outline-none focus:border-transparent transition-all"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <PasswordStrength password={passwordData.newPassword} />
              </div>
              
              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordDataChange('confirmPassword', e.target.value)}
                    required
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#5caaab] outline-none focus:border-transparent transition-all ${
                      passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword 
                        ? 'border-red-300 bg-red-50' 
                        : passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
                {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                  <p className="text-green-500 text-xs mt-1 flex items-center">
                    <FaCheck className="w-3 h-3 mr-1" /> Passwords match
                  </p>
                )}
              </div>

              {/* Email Notification */}
              {/* <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={passwordData.sendEmail}
                  onChange={(e) => handlePasswordDataChange('sendEmail', e.target.checked)}
                  className="w-4 h-4 text-[#5caaab] border-gray-300 rounded focus:ring-[#5caaab]"
                />
                <label htmlFor="sendEmail" className="text-sm text-gray-700">
                  Send email notification to user
                </label>
              </div> */}
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#5caaab] to-[#4a9a9b] text-white rounded-lg hover:from-[#4a9a9b] hover:to-[#3d8b8c] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Changing...
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Delete User</h4>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>? 
                This will move the user to the deleted state and they will no longer be able to access the system.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteUser}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete User'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

{/* Bulk Action Confirmation Modal */}
{showBulkActionModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl max-w-md w-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Confirm {bulkActionType && typeof bulkActionType === 'string' ? bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1) : 'Bulk Action'}
          </h3>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            bulkActionType === 'delete' 
              ? 'bg-red-100' 
              : bulkActionType === 'suspend' || bulkActionType === 'deactivate'
              ? 'bg-orange-100'
              : bulkActionType === 'activate' || bulkActionType === 'restore'
              ? 'bg-green-100'
              : 'bg-blue-100'
          }`}>
            {bulkActionType === 'delete' && (
              <FaTrash className="text-red-600 text-xl" />
            )}
            {(bulkActionType === 'suspend' || bulkActionType === 'deactivate') && (
              <FaPause className="text-orange-600 text-xl" />
            )}
            {(bulkActionType === 'activate' || bulkActionType === 'restore') && (
              <FaCheck className="text-green-600 text-xl" />
            )}
            {(!bulkActionType || !['delete', 'suspend', 'deactivate', 'activate', 'restore'].includes(bulkActionType)) && (
              <FaExclamationTriangle className="text-blue-600 text-xl" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {bulkActionType && typeof bulkActionType === 'string' ? `${bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1)} Users` : 'Bulk Action'}
            </h4>
            <p className="text-sm text-gray-500">
              {bulkActionType === 'delete' 
                ? 'This action cannot be undone' 
                : bulkActionType === 'suspend' || bulkActionType === 'deactivate'
                ? 'Users will be temporarily disabled'
                : bulkActionType === 'activate' || bulkActionType === 'restore'
                ? 'Users will be re-enabled'
                : 'This action may affect multiple users'
              }
            </p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          {bulkActionType === 'delete' && 
            'Are you sure you want to permanently delete the selected users? This action cannot be undone.'
          }
          {(bulkActionType === 'suspend' || bulkActionType === 'deactivate') && 
            'Are you sure you want to suspend the selected users? They will lose access to the system.'
          }
          {(bulkActionType === 'activate' || bulkActionType === 'restore') && 
            'Are you sure you want to activate the selected users? They will regain access to the system.'
          }
          {(!bulkActionType || !['delete', 'suspend', 'deactivate', 'activate', 'restore'].includes(bulkActionType)) && 
            'Are you sure you want to perform this bulk action on the selected users?'
          }
        </p>

        <div className="flex space-x-3">
          <button
            onClick={executeBulkAction}
            disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
              bulkActionType === 'delete'
                ? 'bg-red-600 hover:bg-red-700'
                : bulkActionType === 'suspend' || bulkActionType === 'deactivate'
                ? 'bg-orange-600 hover:bg-orange-700'
                : bulkActionType === 'activate' || bulkActionType === 'restore'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading 
              ? 'Processing...' 
              : `Confirm ${bulkActionType && typeof bulkActionType === 'string' ? bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1) : 'Action'}`
            }
          </button>
          <button
            onClick={closeModal}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}
            
         <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>

    </div>
  );
}

// ============== STEP 1: Create Toast Component (components/Toast.js) ==============

export const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? <FaCheck className="w-4 h-4" /> : <FaTimes className="w-4 h-4" />;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-slide-in`}>
      {icon}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-75">
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  );
};

// ============== STEP 2: Create Password Strength Component ==============
export const PasswordStrength = ({ password }) => {
  const getStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  const getStrengthText = () => {
    if (strength <= 1) return { text: 'Very Weak', color: 'bg-red-500' };
    if (strength === 2) return { text: 'Weak', color: 'bg-orange-500' };
    if (strength === 3) return { text: 'Medium', color: 'bg-yellow-500' };
    if (strength === 4) return { text: 'Strong', color: 'bg-green-500' };
    return { text: 'Very Strong', color: 'bg-green-600' };
  };

  const { text, color } = getStrengthText();

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">Password Strength</span>
        <span className={`font-medium ${strength >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
          {text}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AdminPanel;