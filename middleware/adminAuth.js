// middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'Please login' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ msg: 'User not found' });
    if (user.role !== 'admin') return res.status(403).json({ msg: 'Admin access required' });

    req.user = user;
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(401).json({ msg: 'Admin access required or Token is not valid' });
  }
};

module.exports = adminAuth;
