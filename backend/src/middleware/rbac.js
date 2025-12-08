const { verifyToken } = require('./auth');

// Role-Based Access Control middleware
const allowRoles = (allowedRoles) => {
  return (req, res, next) => {
    // First verify token
    verifyToken(req, res, () => {
      // Check if user role is allowed
      if (!req.user || !req.user.role) {
        return res.status(401).json({ error: 'Unauthorized: Invalid user' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Forbidden: Insufficient permissions',
          required: allowedRoles,
          current: req.user.role
        });
      }

      next();
    });
  };
};

module.exports = {
  allowRoles
};

