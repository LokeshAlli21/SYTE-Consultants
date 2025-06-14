import { query, getClient, uploadToS3, deleteFromS3 } from '../aws/awsClient.js';
import bcrypt from 'bcrypt';

// CREATE - Add a new user
export const createUser = async (req, res) => {
  const { name, email, phone, password, role = 'user', status = 'active', photo_url, access_fields } = req.body;
  console.log('Creating user with data:', req.body);

  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Convert JS array to PostgreSQL array format string
    const pgArray = access_fields && Array.isArray(access_fields)
      ? `{${access_fields.join(',')}}`
      : '{dashboard}'; // default if not provided

    const insertQuery = `
      INSERT INTO users (name, email, phone, password, role, status, photo_url, status_for_delete, access_fields, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id, name, email, phone, role, status, photo_url, status_for_delete, access_fields, created_at
    `;

    const values = [
      name,
      email,
      phone || null,
      hashedPassword,
      role,
      status,
      photo_url || null,
      'active',
      pgArray
    ];

    const result = await query(insertQuery, values);
    const user = result.rows[0];

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle unique constraint violation (duplicate email)
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// READ - Get all users (with option to include soft-deleted users)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role, includeDeleted = false } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['role != $1'];
    let queryParams = ['admin'];
    let paramIndex = 2;

    // Exclude soft-deleted users unless includeDeleted=true
    if (includeDeleted !== 'true') {
      whereConditions.push(`status_for_delete != $${paramIndex}`);
      queryParams.push('deleted');
      paramIndex++;
    }

    // Apply optional filters
    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    
    if (role) {
      whereConditions.push(`role = $${paramIndex}`);
      queryParams.push(role);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated users
    const usersQuery = `
      SELECT id, name, email, phone, role, status, status_for_delete, photo_url, created_at, access_fields
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const usersResult = await query(usersQuery, queryParams);

    // Parse access_fields JSON for each user
    const users = usersResult.rows.map(user => ({
      ...user,
      access_fields: user.access_fields ? JSON.parse(user.access_fields) : null
    }));

    res.status(200).json({
      users: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit)
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
    const selectQuery = `
      SELECT id, name, email, phone, role, status, status_for_delete, photo_url, created_at, access_fields
      FROM users
      WHERE id = $1 AND status_for_delete != 'deleted'
    `;

    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    // Parse access_fields JSON
    user.access_fields = user.access_fields ? JSON.parse(user.access_fields) : null;

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// UPDATE - Update user by ID
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, status, password, photo_url, access_fields } = req.body;
  console.log('Updating user with ID:', id, 'and data:', req.body);

  try {
    // Check if user exists and is not soft-deleted
    const checkQuery = `
      SELECT id FROM users
      WHERE id = $1 AND status_for_delete != 'deleted'
    `;
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare update fields and values
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      updateValues.push(name);
      paramIndex++;
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex}`);
      updateValues.push(email);
      paramIndex++;
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex}`);
      updateValues.push(phone);
      paramIndex++;
    }
    if (role !== undefined) {
      updateFields.push(`role = $${paramIndex}`);
      updateValues.push(role);
      paramIndex++;
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      updateValues.push(status);
      paramIndex++;
    }
    if (photo_url !== undefined) {
      updateFields.push(`photo_url = $${paramIndex}`);
      updateValues.push(photo_url);
      paramIndex++;
    }
    if (access_fields !== undefined) {
      updateFields.push(`access_fields = $${paramIndex}`);
      updateValues.push(JSON.stringify(access_fields));
      paramIndex++;
    }

    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push(`password = $${paramIndex}`);
      updateValues.push(hashedPassword);
      paramIndex++;
    }

    // If no fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add updated_at field
    updateFields.push(`updated_at = NOW()`);

    // Add user ID for WHERE clause
    updateValues.push(id);

    const updateQuery = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, phone, role, status, status_for_delete, photo_url, created_at, access_fields
    `;

    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    // Parse access_fields JSON
    user.access_fields = user.access_fields ? JSON.parse(user.access_fields) : null;

    res.status(200).json({
      message: 'User updated successfully',
      user: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Handle unique constraint violation (duplicate email)
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// SOFT DELETE - Mark user as deleted
export const softDeleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if user exists
    const checkQuery = `
      SELECT id, status_for_delete FROM users WHERE id = $1
    `;
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (checkResult.rows[0].status_for_delete === 'deleted') {
      return res.status(200).json({ error: 'User is already deleted' });
    }

    const updateQuery = `
      UPDATE users
      SET status_for_delete = 'deleted', status = 'inactive', updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, email
    `;

    const result = await query(updateQuery, [id]);

    res.status(200).json({
      message: 'User deleted successfully',
      user: result.rows[0]
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
    // Check if user exists
    const checkQuery = `
      SELECT id, status_for_delete FROM users WHERE id = $1
    `;
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (checkResult.rows[0].status_for_delete !== 'deleted') {
      return res.status(200).json({ error: 'User is not deleted' });
    }

    const updateQuery = `
      UPDATE users
      SET status_for_delete = 'active', status = 'active', updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, email, phone, role, status, status_for_delete, created_at, access_fields
    `;

    const result = await query(updateQuery, [id]);
    const user = result.rows[0];
    user.access_fields = user.access_fields ? JSON.parse(user.access_fields) : null;

    res.status(200).json({
      message: 'User restored successfully',
      user: user
    });
  } catch (error) {
    console.error('Error restoring user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// SEARCH - Search users by name or email
export const searchUsers = async (req, res) => {
  const { query: searchQuery, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    if (!searchQuery) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchPattern = `%${searchQuery}%`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      WHERE role != 'admin'
        AND status_for_delete != 'deleted'
        AND (name ILIKE $1 OR email ILIKE $1)
    `;
    const countResult = await query(countQuery, [searchPattern]);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const searchSql = `
      SELECT id, name, email, phone, role, status, status_for_delete, photo_url, created_at, access_fields
      FROM users
      WHERE role != 'admin'
        AND status_for_delete != 'deleted'
        AND (name ILIKE $1 OR email ILIKE $1)
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(searchSql, [searchPattern, limit, offset]);

    // Parse access_fields JSON for each user
    const users = result.rows.map(user => ({
      ...user,
      access_fields: user.access_fields ? JSON.parse(user.access_fields) : null
    }));

    res.status(200).json({
      users: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit)
      },
      searchQuery: searchQuery
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET USER STATISTICS
export const getUserStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE role != 'admin' AND status_for_delete != 'deleted') as total,
        COUNT(*) FILTER (WHERE role != 'admin' AND status_for_delete != 'deleted' AND status = 'active') as active,
        COUNT(*) FILTER (WHERE role != 'admin' AND status_for_delete != 'deleted' AND status = 'inactive') as inactive,
        COUNT(*) FILTER (WHERE role != 'admin' AND status_for_delete != 'deleted' AND status = 'blocked') as blocked,
        COUNT(*) FILTER (WHERE role != 'admin' AND status_for_delete = 'deleted') as deleted,
        COUNT(*) FILTER (WHERE role = 'admin') as admins
      FROM users
    `;

    const result = await query(statsQuery);
    const stats = result.rows[0];

    res.status(200).json({
      statistics: {
        total: parseInt(stats.total),
        active: parseInt(stats.active),
        inactive: parseInt(stats.inactive),
        blocked: parseInt(stats.blocked),
        deleted: parseInt(stats.deleted),
        admins: parseInt(stats.admins)
      }
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// UPDATE - Change user password
export const changeUserPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  
  try {
    // Validate required fields
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user exists and is not deleted
    const checkQuery = `
      SELECT id, name, email, status_for_delete
      FROM users
      WHERE id = $1
    `;
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (checkResult.rows[0].status_for_delete === 'deleted') {
      return res.status(400).json({ error: 'Cannot change password for deleted user' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password
    const updateQuery = `
      UPDATE users
      SET password = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, role, status, created_at
    `;

    const result = await query(updateQuery, [hashedPassword, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Password changed successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error changing user password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// BLOCK USER - Block a user (set status to blocked)
export const blockUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if user exists and get current status
    const checkQuery = `
      SELECT id, status, status_for_delete, name, email, role
      FROM users
      WHERE id = $1 AND status_for_delete != 'deleted'
    `;
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = checkResult.rows[0];

    // Check if user is already blocked
    if (user.status === 'blocked') {
      return res.status(200).json({ error: 'User is already blocked' });
    }

    // Check if trying to block an admin
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot block admin users' });
    }

    // Update user status to blocked
    const updateQuery = `
      UPDATE users
      SET status = 'blocked', updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, email, phone, role, status, status_for_delete, created_at
    `;

    const result = await query(updateQuery, [id]);

    res.status(200).json({
      message: 'User blocked successfully',
      user: result.rows[0]
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
    // Check if user exists and get current status
    const checkQuery = `
      SELECT id, status, status_for_delete, name, email
      FROM users
      WHERE id = $1 AND status_for_delete != 'deleted'
    `;
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = checkResult.rows[0];

    // Check if user is not blocked
    if (user.status !== 'blocked') {
      return res.status(200).json({ error: 'User is already not blocked' });
    }

    // Update user status to active
    const updateQuery = `
      UPDATE users
      SET status = 'active', updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, email, phone, role, status, status_for_delete, created_at
    `;

    const result = await query(updateQuery, [id]);

    res.status(200).json({
      message: 'User unblocked successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// UPLOAD USER PHOTO - Upload photo to AWS S3
export const uploadUserPhoto = async (req, res) => {
  try {
    console.log('📸 Uploading user photo to AWS S3...');
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No photo uploaded.' });
    }

    // We expect only one file with fieldname 'photo_url'
    const photoFile = files.find(file => file.fieldname === 'photo_url');
    
    if (!photoFile) {
      return res.status(400).json({ message: 'Photo file not found. Expected fieldname: photo_url' });
    }

    // Extract user role from filename
    // Expected filename format: {role}_{UserName}_Photo_{timestamp}.{ext}
    let userRole = 'user'; // default role
    
    const originalName = photoFile.originalname;
    const filenameParts = originalName.split('_');
    
    if (filenameParts.length >= 3) {
      // Extract role from first part of filename
      const extractedRole = filenameParts[0].toLowerCase();
      
      // Validate if it's a valid role
      const validRoles = ['admin', 'user', 'manager', 'supervisor', 'moderator'];
      if (validRoles.includes(extractedRole)) {
        userRole = extractedRole;
      }
    }

    console.log(`📋 Extracted role from filename: ${userRole}`);

    // Create S3 key path based on role
    const timestamp = Date.now();
    const fileExtension = originalName.split('.').pop();
    const s3Key = `user-profile-photos/${userRole}/${timestamp}_${originalName}`;

    console.log(`📁 Uploading photo to S3 path: ${s3Key}`);

    // Upload to AWS S3
    const s3Url = await uploadToS3(photoFile, s3Key);
    
    console.log(`✅ Photo uploaded successfully to: ${s3Url}`);

    return res.status(200).json({
      photo_url: s3Url,
      message: 'Photo uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Unexpected error in uploadUserPhoto:', error);
    return res.status(500).json({ 
      message: 'Server error while uploading user photo.',
      error: error.message
    });
  }
};