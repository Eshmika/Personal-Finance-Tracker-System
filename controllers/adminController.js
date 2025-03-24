const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');
const bcrypt = require('bcryptjs');
const { getAllTransactions } = require('./transactionController');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update user by ID
const updateUserById = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updatedFields = { name, email, role };

    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user = await User.findByIdAndUpdate(req.params.id, { $set: updatedFields }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete user by ID
const deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();
    
    const savedUser = newUser.toObject();
    delete savedUser.password;

    res.json(savedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get current system settings
const getSystemSettings = async (req, res) => {
  try {
      const settings = await SystemSetting.findOne({});
      res.json(settings);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
  }
};

// Update system settings
const updateSystemSettings = async (req, res) => {
  try {
      const updatedSystemSettings = await SystemSetting.findOneAndUpdate(
          {},
          { ...req.body, updatedAt: Date.now() },
          { new: true, upsert: true }
      );
      res.json(updatedSystemSettings);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  createUser,
  getSystemSettings,
  updateSystemSettings
};