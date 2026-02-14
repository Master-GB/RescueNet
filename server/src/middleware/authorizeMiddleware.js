/**
 * Middleware to check if user has required role(s)
 * Must be used after authenticate middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission to perform this action.",
        requiredRole: allowedRoles,
        yourRole: req.user.role,
      });
    }

    next();
  };
};
