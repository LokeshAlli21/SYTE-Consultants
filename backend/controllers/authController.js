import { supabase } from '../supabase/supabaseClient.js';
import { generateToken } from '../utils/generateToken.js';

// LOGIN an Existing User
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🚀 Logging in user:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const validPassword = (password === user.password)

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ User logged in:', user);

    const token =  generateToken(user.id)
    console.log("token: ",token);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        token: token,
      },
      message: 'User logged in successfully',
    });
  } catch (error) {
    console.error('Login Error:', error);
    next(error);
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
