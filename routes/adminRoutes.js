const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  createUser,
  getSystemSettings,
  updateSystemSettings
} = require("../controllers/adminController");

router.get("/users", adminAuth, getAllUsers);
router.get("/users/:id", adminAuth, getUserById);
router.post("/users", adminAuth, createUser);
router.put("/users/:id", adminAuth, updateUserById);
router.delete("/users/:id", adminAuth, deleteUserById);
router.get("/settings", adminAuth, getSystemSettings);
router.put("/settings", adminAuth, updateSystemSettings);

module.exports = router;
