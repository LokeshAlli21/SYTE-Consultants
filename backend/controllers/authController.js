import { query } from '../aws/awsClient.js';
import { generateToken } from '../utils/generateToken.js';
import bcrypt from 'bcrypt';

// Function to generate hash for a password
const generatePasswordHash = async (password) => {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    return hash;
  } catch (error) {
    console.error('Error generating hash:', error);
  }
};

// Generate hash 
// generatePasswordHash('sample@123');

// You can also create a one-liner for quick testing:
// console.log(await bcrypt.hash('12345678', 10));

// LOGIN an Existing User
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🚀 Logging in user:', email);
    console.log('Request body:', req.body);

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Fetch user from PostgreSQL
    const userQuery = `
      SELECT id, name, email, phone, password, role, status, status_for_delete, photo_url, created_at, access_fields
      FROM users
      WHERE email = $1
    `;

    const result = await query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check if user account is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: user.status === 'blocked' ? 'Your account has been blocked' : 'Account is not active' 
      });
    }

    // Check if user is not soft deleted
    if (user.status_for_delete === 'deleted') {
      return res.status(403).json({ message: 'Account not found' });
    }

    // Verify password using bcrypt
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password verification result:', validPassword);

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ User logged in:', { id: user.id, email: user.email, role: user.role });

    // Generate JWT token
    const token = generateToken(user.id);
    console.log("Token generated for user:", user.id);
    
    // Parse access_fields JSON if it exists
    let accessFields = null;
    if (user.access_fields) {
      try {
        accessFields = JSON.parse(user.access_fields);
      } catch (jsonError) {
        console.warn('Failed to parse access_fields JSON:', jsonError);
        accessFields = user.access_fields; // Keep as string if parsing fails
      }
    }
    
    // Return user data without password
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        token: token,
        photo_url: user.photo_url || null, // Handle optional photo_url
        created_at: user.created_at || null,
        access_fields: accessFields, // Handle optional access_fields
      },
      message: 'User logged in successfully',
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = req.user; // ✅ We already set req.user in middleware

    // Parse access_fields JSON if it exists and is a string
    let accessFields = user.access_fields;
    if (typeof user.access_fields === 'string' && user.access_fields) {
      try {
        accessFields = JSON.parse(user.access_fields);
      } catch (jsonError) {
        console.warn('Failed to parse access_fields JSON:', jsonError);
        accessFields = user.access_fields; // Keep as string if parsing fails
      }
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        photo_url: user.photo_url || null, // Handle optional photo_url
        created_at: user.created_at || null,
        access_fields: accessFields, // Handle optional access_fields
      },
    });
  } catch (error) {
    next(error);
  }
};