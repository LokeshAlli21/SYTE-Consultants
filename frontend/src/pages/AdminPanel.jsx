import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
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
  FaShieldAlt
} from 'react-icons/fa';
import { MdAdminPanelSettings, MdVerified, MdBlock, MdSecurity } from 'react-icons/md';
import { BiRefresh, BiExport } from 'react-icons/bi';
import { IoMdTime } from 'react-icons/io';
import databaseService from '../backend-services/database/database';

function AdminPanel() {
  const userData = useSelector(state => state.auth.userData);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    sendEmail: true
  });
  
  // Form data for create/edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    password: ''
  });

  // Permission check
  if (userData && userData.role !== 'admin') {
    return (
      <div className="min-h-screen  flex items-center justify-center">
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
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const usersData = await databaseService.getAllUsers();
      console.log("Fetched Users:", usersData);
      
      setUsers(usersData || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError('Failed to fetch users. Please try again.');
      // Enhanced fallback sample data
      setUsers([
        {
          id: 1,
          name: "John Admin",
          email: "admin@syte.com",
          phone: "1234567890",
          password: "********",
          created_at: "2025-01-15T10:30:00",
          last_login: "2025-06-01T14:20:00",
          role: "admin",
          status: "active",
          login_attempts: 0
        },
        {
          id: 2,
          name: "Jane Manager",
          email: "manager@syte.com",
          phone: "1234567891",
          password: "********",
          created_at: "2025-02-10T09:15:00",
          last_login: "2025-05-30T16:45:00",
          role: "manager",
          status: "active",
          login_attempts: 0
        },
        {
          id: 3,
          name: "Bob User",
          email: "user@syte.com",
          phone: "1234567892",
          password: "********",
          created_at: "2025-03-20T11:00:00",
          last_login: "2025-05-28T12:30:00",
          role: "user",
          status: "blocked",
          login_attempts: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Sorting and filtering
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'created_at' || sortField === 'last_login') {
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
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);

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
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'user',
      status: user?.status || 'active',
      password: ''
    });
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
      sendEmail: true
    });
    setShowPasswordModal(true);
  };

  const handleBlockUser = async (user) => {
    try {
      setLoading(true);
      // Update user status
      await databaseService.updateUserStatus(user.id, user.status === 'blocked' ? 'active' : 'blocked');
      setSuccess(`User ${user.status === 'blocked' ? 'unblocked' : 'blocked'} successfully`);
      fetchUsers();
    } catch (error) {
      setError('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      setError('Please select users first');
      return;
    }
    setShowBulkActionModal(true);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
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
    } catch (error) {
      setError('Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      await databaseService.changeUserPassword(selectedUser.id, passwordData.newPassword);
      if (passwordData.sendEmail) {
        await databaseService.sendPasswordChangeNotification(selectedUser.email);
      }
      setSuccess('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: '', sendEmail: true });
    } catch (error) {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await databaseService.deleteUser(userToDelete.id);
      setSuccess('User deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowUserModal(false);
    setShowPasswordModal(false);
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
      password: ''
    });
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
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    const icons = {
      active: <FaCheckCircle className="w-3 h-3 mr-1" />,
      blocked: <FaBan className="w-3 h-3 mr-1" />,
      pending: <IoMdTime className="w-3 h-3 mr-1" />
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
      'Last Login': formatDate(user.last_login)
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

  // Form input handlers - memoized to prevent recreation
  const handleFormDataChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePasswordDataChange = useCallback((field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 pb-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#5caaab] to-[#4a9a9b] rounded-xl flex items-center justify-center shadow-lg">
                <MdAdminPanelSettings className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Manage users, roles, and system settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                <MdVerified className="text-green-500" />
                <span className="text-sm font-medium text-gray-700">Welcome, {userData?.name}</span>
              </div>
              <button
                onClick={exportUsers}
                className="px-4 py-2 bg-[#5caaab] text-white rounded-lg hover:bg-[#4a9a9b] transition-colors flex items-center space-x-2"
              >
                <BiExport />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#5caaab]/20 rounded-lg flex items-center justify-center">
                <FaUserShield className="text-[#5caaab] text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#5caaab]/20 rounded-lg flex items-center justify-center">
                <FaUserShield className="text-[#5caaab] text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admin Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaUserCheck className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaUserTimes className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Blocked Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'blocked').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                <p className="text-sm text-gray-500 mt-1">Manage user accounts, roles, and permissions</p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] focus:border-transparent"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                  </select>
                  <select
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={fetchUsers}
                    className="px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <BiRefresh />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => handleUserAction(null, 'create')}
                    className="px-4 py-2.5 bg-[#5caaab] text-white rounded-lg hover:bg-[#4a9a9b] transition-colors flex items-center space-x-2"
                  >
                    <FaPlus />
                    <span>Add User</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('block')}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    Block Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('unblock')}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    Unblock Selected
                  </button>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error && users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FaExclamationTriangle className="text-4xl mb-4 text-red-400" />
                <p className="text-lg mb-2">Failed to load users</p>
                <button
                  onClick={fetchUsers}
                  className="px-4 py-2 bg-[#5caaab] text-white rounded-lg hover:bg-[#4a9a9b] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredAndSortedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FaUsers className="text-4xl mb-4" />
                <p className="text-lg">No users found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 accent-[#5caaab] text-[#5caaab] border-gray-300 rounded focus:ring-[#5caaab]"
                      />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>User</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Contact</span>
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Role</span>
                        {getSortIcon('role')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-4 h-4 accent-[#5caaab] text-[#5caaab] border-gray-300 rounded focus:ring-[#5caaab]"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#5caaab] to-[#4a9a9b] flex items-center justify-center text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <FaEnvelope className="w-3 h-3 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <FaPhone className="w-3 h-3 mr-2 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center w-fit ">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          {getStatusBadge(user.status)}
                          {user.login_attempts > 0 && (
                            <div className="text-xs text-red-600 flex items-center">
                              <FaExclamationTriangle className="w-3 h-3 mr-1" />
                              {user.login_attempts} failed attempts
                            </div>
                          )}
                        </div>
                      </td>
<td className="p-2">
  <div className="flex items-center w-fit gap-2 p-2 rounded-xl bg-white/80 border border-gray-200/50 hover:shadow-md transition-all duration-300 group-hover:border-gray-300/60">
    {/* View */}
    <button
      title="View Details"
      onClick={() => handleUserAction(user, 'view')}
      className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <FaEye className="w-3.5 h-3.5" />
    </button>

    {/* Edit */}
    <button
      title="Edit User"
      onClick={() => handleUserAction(user, 'edit')}
      className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <FaEdit className="w-3.5 h-3.5" />
    </button>

    {/* Change Password */}
    <button
      title="Change Password"
      onClick={() => handlePasswordChange(user)}
      className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <FaKey className="w-3.5 h-3.5" />
    </button>

    {/* Block/Unblock */}
    <button
      title={user.status === 'blocked' ? 'Unblock User' : 'Block User'}
      onClick={() => handleBlockUser(user)}
      className={`p-2.5 rounded-lg text-white hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md ${
        user.status === 'blocked'
          ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
          : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
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
      className="p-2.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <FaTrash className="w-3.5 h-3.5" />
    </button>
  </div>
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {(
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-2 text-sm border rounded-md ${
                        currentPage === index + 1
                          ? 'bg-[#5caaab] text-white border-[#5caaab]'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <FaCheckCircle className="mr-2" />
            <span>{success}</span>
            <button
              onClick={() => setSuccess('')}
              className="ml-4 text-green-500 hover:text-green-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Create New User' : 
                   modalMode === 'edit' ? 'Edit User' : 'User Details'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              {modalMode === 'view' ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#5caaab] to-[#4a9a9b] flex items-center justify-center text-white font-bold text-xl">
                      {selectedUser?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedUser?.name}</h3>
                      <p className="text-gray-500">{selectedUser?.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{selectedUser?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <div>{getRoleBadge(selectedUser?.role)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div>{getStatusBadge(selectedUser?.status)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                      <p className="text-gray-900">{formatDate(selectedUser?.created_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                      <p className="text-gray-900">{formatDate(selectedUser?.last_login)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Login Attempts</label>
                      <p className={`font-medium ${selectedUser?.login_attempts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedUser?.login_attempts || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] focus:border-transparent"
                        value={formData.name}
                        onChange={(e) => handleFormDataChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] focus:border-transparent"
                        value={formData.email}
                        onChange={(e) => handleFormDataChange('email', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] focus:border-transparent"
                        value={formData.phone}
                        onChange={(e) => handleFormDataChange('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] focus:border-transparent"
                        value={formData.role}
                        onChange={(e) => handleFormDataChange('role', e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] focus:border-transparent"
                        value={formData.status}
                        onChange={(e) => handleFormDataChange('status', e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    {modalMode === 'create' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] focus:border-transparent"
                          value={formData.password}
                          onChange={(e) => handleFormDataChange('password', e.target.value)}
                          placeholder="Minimum 8 characters"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2.5 bg-[#5caaab] text-white rounded-lg hover:bg-[#4a9a9b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : modalMode === 'create' ? 'Create User' : 'Update User'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] focus:border-transparent"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordDataChange('newPassword', e.target.value)}
                    placeholder="Minimum 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab] focus:border-transparent"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordDataChange('confirmPassword', e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={passwordData.sendEmail}
                    onChange={(e) => handlePasswordDataChange('sendEmail', e.target.checked)}
                    className="w-4 h-4 accent-[#5caaab] text-[#5caaab] border-gray-300 rounded focus:ring-[#5caaab]"
                  />
                  <label htmlFor="sendEmail" className="ml-2 text-sm text-gray-700">
                    Send notification email to user
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2.5 bg-[#5caaab] text-white rounded-lg hover:bg-[#4a9a9b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Delete User Account</p>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>? 
                This will permanently remove their account and all associated data.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={loading}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkActionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Bulk Action</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <p className="text-gray-700 mb-6">
                Are you sure you want to perform this action on {selectedUsers.length} selected user{selectedUsers.length > 1 ? 's' : ''}?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle bulk action here
                    closeModal();
                  }}
                  className="px-4 py-2.5 bg-[#5caaab] text-white rounded-lg hover:bg-[#4a9a9b] transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;