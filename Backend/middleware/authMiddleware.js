// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // 1. Get token from cookie
  const token = req.cookies.token;

  if (!token) {
    // If no token, user is not authenticated
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user info to req object (excluding password hash)
    // You might want to fetch the user from DB again to ensure it's still valid
    // For simplicity, we'll just use decoded info for now.
    req.user = decoded; // Contains id, email, name, pinNumber, branch, user_role
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    // Token is invalid or expired
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };