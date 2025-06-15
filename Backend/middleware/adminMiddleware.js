function adminOnly(req, res, next) {
  if (req.user && req.user.user_role === 'Admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied.Can Be Accessed By Admins only.' });
}
module.exports = adminOnly;
