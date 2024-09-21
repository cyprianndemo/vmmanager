const adminAuth = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'Admin') {
      next();
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(403).send({ error: 'Access denied. Admin rights required.' });
  }
};

module.exports = adminAuth;