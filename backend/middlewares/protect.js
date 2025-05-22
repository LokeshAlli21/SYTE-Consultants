import { supabase } from '../supabase/supabaseClient.js';
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Supabase query to get the user by id
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (error) {
        console.error('Supabase Error:', error);
        return res.status(401).json({ message: 'User not found' });
      }

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user; // ✅ Now you have full user info in req.user
      next();
    } else {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};


// import { supabase } from '../supabase/supabaseClient.js';

// export const protect = async (req, res, next) => {
//   try {
//     let token;

//     // Check if authorization header exists and contains a Bearer token
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith('Bearer')
//     ) {
//       token = req.headers.authorization.split(' ')[1];
//       // console.log(token);
      

//       // Fetch user information from Supabase using decoded user ID
//       const { data, error } = await supabase.auth.getUser(token);

//       if (error || !data.user) {
//         return res.status(401).json({ message: 'User not found or unauthorized' });
//       }

//       // Attach user data to req.user
//       req.user = data.user; // Full user information

//       next(); // Proceed to the next middleware or route handler
//     } else {
//       // If no token is provided, return unauthorized error
//       return res.status(401).json({ message: 'Not authorized, no token' });
//     }
//   } catch (error) {
//     console.error('Auth Middleware Error:', error);
//     res.status(401).json({ message: 'Not authorized, token failed' });
//   }
// };
