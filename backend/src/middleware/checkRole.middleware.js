function checkRole(roles) {
  return (req, res, next) => {
    // Check if the user is authenticated and their role is in the allowed roles array
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
    }
    next(); // Proceed if the user has the correct role
  };
}

module.exports = checkRole;
