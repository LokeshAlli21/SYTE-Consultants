import { supabase } from '../supabase/supabaseClient.js';
import bcrypt from 'bcrypt';

// CREATE - Add a new user
export const createUser = async (req, res) => {
  const { name, email, phone, password, role = 'user', status = 'active' } = req.body;
  
  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          phone,
          password: hashedPassword,
          role,
          status,
          status_for_delete: 'active'
        }
      ])
      .select();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Email already exists' });
      }
      throw error;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = data[0];
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// READ - Get all users (with option to include soft-deleted users)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, role, includeDeleted = false } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('id, name, email, phone, role, status, status_for_delete, created_at', { count: 'exact' })
      .neq('role', 'admin')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Exclude soft-deleted users unless includeDeleted=true
    if (includeDeleted !== 'true') {
      query = query.neq('status_for_delete', 'deleted');
    }

    // Apply optional filters
    if (status) {
      query = query.eq('status', status);
    }
    if (role) {
      query = query.eq('role', role);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      users: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// READ - Get user by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, status, status_for_delete, created_at')
      .eq('id', id)
      .neq('status_for_delete', 'deleted')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// UPDATE - Update user by ID
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, status, password } = req.body;
  
  try {
    // Check if user exists and is not soft-deleted
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .neq('status_for_delete', 'deleted')
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw fetchError;
    }

    // Prepare update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, phone, role, status, status_for_delete, created_at');

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Email already exists' });
      }
      throw error;
    }

    res.status(200).json({
      message: 'User updated successfully',
      user: data[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// SOFT DELETE - Mark user as deleted
export const softDeleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if user exists and is not already soft-deleted
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, status_for_delete')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw fetchError;
    }

    if (existingUser.status_for_delete === 'deleted') {
      return res.status(400).json({ error: 'User is already deleted' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ 
        status_for_delete: 'deleted',
        status: 'inactive'
      })
      .eq('id', id)
      .select('id, name, email');

    if (error) throw error;

    res.status(200).json({
      message: 'User deleted successfully',
      user: data[0]
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// RESTORE - Restore soft-deleted user
export const restoreUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if user exists and is soft-deleted
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, status_for_delete')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw fetchError;
    }

    if (existingUser.status_for_delete !== 'deleted') {
      return res.status(400).json({ error: 'User is not deleted' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ 
        status_for_delete: 'active',
        status: 'active'
      })
      .eq('id', id)
      .select('id, name, email, phone, role, status, status_for_delete, created_at');

    if (error) throw error;

    res.status(200).json({
      message: 'User restored successfully',
      user: data[0]
    });
  } catch (error) {
    console.error('Error restoring user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// SEARCH - Search users by name or email
export const searchUsers = async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const { data, error, count } = await supabase
      .from('users')
      .select('id, name, email, phone, role, status, status_for_delete, created_at', { count: 'exact' })
      .neq('role', 'admin')
      .neq('status_for_delete', 'deleted')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      users: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      },
      searchQuery: query
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET USER STATISTICS
export const getUserStats = async (req, res) => {
  try {
    const queries = await Promise.all([
      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .neq('role', 'admin')
        .neq('status_for_delete', 'deleted'),

      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .neq('role', 'admin')
        .neq('status_for_delete', 'deleted')
        .eq('status', 'active'),

      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .neq('role', 'admin')
        .neq('status_for_delete', 'deleted')
        .eq('status', 'inactive'),

      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .neq('role', 'admin')
        .eq('status_for_delete', 'deleted'),

      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('role', 'admin'),

      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .neq('role', 'admin')
        .neq('status_for_delete', 'deleted')
        .eq('status', 'blocked')
    ]);

    const [
      totalUsersRes,
      activeUsersRes,
      inactiveUsersRes,
      deletedUsersRes,
      adminUsersRes,
      blockedUsersRes
    ] = queries;

    const hasError = queries.some((q) => q.error);
    if (hasError) {
      throw new Error('Error in one or more queries');
    }

    res.status(200).json({
      statistics: {
        total: totalUsersRes.count,
        active: activeUsersRes.count,
        inactive: inactiveUsersRes.count,
        blocked: blockedUsersRes.count,
        deleted: deletedUsersRes.count,
        admins: adminUsersRes.count
      }
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// BLOCK USER - Block a user (set status to blocked)
export const blockUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if user exists and is not soft-deleted
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, status, status_for_delete, name, email')
      .eq('id', id)
      .neq('status_for_delete', 'deleted')
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw fetchError;
    }

    // Check if user is already blocked
    if (existingUser.status === 'blocked') {
      return res.status(400).json({ error: 'User is already blocked' });
    }

    // Check if trying to block an admin
    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', id)
      .single();

    if (adminError) throw adminError;

    if (adminCheck.role === 'admin') {
      return res.status(403).json({ error: 'Cannot block admin users' });
    }

    // Update user status to blocked
    const { data, error } = await supabase
      .from('users')
      .update({ status: 'blocked' })
      .eq('id', id)
      .select('id, name, email, phone, role, status, status_for_delete, created_at');

    if (error) throw error;

    res.status(200).json({
      message: 'User blocked successfully',
      user: data[0]
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// UNBLOCK USER - Unblock a user (set status to active)
export const unblockUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if user exists and is not soft-deleted
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, status, status_for_delete, name, email')
      .eq('id', id)
      .neq('status_for_delete', 'deleted')
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw fetchError;
    }

    // Check if user is not blocked
    if (existingUser.status !== 'blocked') {
      return res.status(400).json({ error: 'User is not blocked' });
    }

    // Update user status to active
    const { data, error } = await supabase
      .from('users')
      .update({ status: 'active' })
      .eq('id', id)
      .select('id, name, email, phone, role, status, status_for_delete, created_at');

    if (error) throw error;

    res.status(200).json({
      message: 'User unblocked successfully',
      user: data[0]
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};