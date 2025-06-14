import { query, getSignedUrl } from '../aws/awsClient.js'; 
import { generateToken } from '../utils/generateToken.js';
import bcrypt from 'bcrypt';

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🚀 Logging in user:', email);
    console.log('Request body:', req.body);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

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

    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: user.status === 'blocked' ? 'Your account has been blocked' : 'Account is not active' 
      });
    }

    if (user.status_for_delete === 'deleted') {
      return res.status(403).json({ message: 'Account not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password provided:', password);
    console.log('Hashed password from DB:', user.password);
    console.log('Password verification result:', validPassword);

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    console.log("Token generated for user:", user.id);

    let accessFields = null;
    if (user.access_fields) {
      try {
        accessFields = JSON.parse(user.access_fields);
      } catch (jsonError) {
        console.warn('Failed to parse access_fields JSON:', jsonError);
        accessFields = user.access_fields;
      }
    }

    // ✅ Generate signed URL if photo_url exists
    let signedPhotoUrl = null;
    if (user.photo_url) {
      signedPhotoUrl = getSignedUrl(user.photo_url);
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
        token: token,
        photo_url: signedPhotoUrl, // ✅ use signed URL
        created_at: user.created_at || null,
        access_fields: accessFields,
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
    const user = req.user;

    let accessFields = user.access_fields;
    if (typeof user.access_fields === 'string' && user.access_fields) {
      try {
        accessFields = JSON.parse(user.access_fields);
      } catch (jsonError) {
        console.warn('Failed to parse access_fields JSON:', jsonError);
      }
    }

    // ✅ Generate signed URL if photo_url exists
    let signedPhotoUrl = null;
    if (user.photo_url) {
      signedPhotoUrl = getSignedUrl(user.photo_url);
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
        photo_url: signedPhotoUrl, // ✅ use signed URL
        created_at: user.created_at || null,
        access_fields: accessFields,
      },
    });
  } catch (error) {
    next(error);
  }
};