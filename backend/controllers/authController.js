import { supabase } from '../supabase/supabaseClient.js';
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

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, password, role, status, status_for_delete')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

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

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ User logged in:', { id: user.id, email: user.email, role: user.role });

    // Generate JWT token
    const token = generateToken(user.id);
    console.log("Token generated for user:", user.id);
    
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
      },
    });
  } catch (error) {
    next(error);
  }
};


// export const loginUser = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     console.log('🚀 Logging in user:', email);

//     if (!email || !password) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Login user with Supabase
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       console.error('Supabase Login Error:', error);
//       return res.status(401).json({ message: error.message });
//     }

//     console.log('✅ User Logged In:', data.user.id);

//     res.status(200).json(data);
//   } catch (error) {
//     console.error('Login Error:', error);
//     next(error);
//   }
// };

// GET the Current Logged-In User
// export const getCurrentUser = async (req, res, next) => {
//   try {
//     const { authorization } = req.headers;
//     console.log('authorization: ',authorization);
    

//     if (!authorization || !authorization.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'Unauthorized: No token provided' });
//     }

//     const token = authorization.split(' ')[1];

//     // Validate the access token with Supabase
//     const { data: { user }, error } = await supabase.auth.getUser(token);

//     if (error || !user) {
//       console.error('Supabase Get User Error:', error);
//       return res.status(401).json({ message: 'Unauthorized: Invalid token' });
//     }

//     console.log('✅ Current User:', user.id);

//     res.status(200).json({
//       message: 'Current user fetched successfully',
//       user: {
//         id: user.id,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error('Get Current User Error:', error);
//     next(error);
//   }
// };
