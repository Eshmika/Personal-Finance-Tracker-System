const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authToken");
const {
  addGoal,
  getGoalsWithProgress,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");

router.post("/goals", authMiddleware, addGoal);
router.get("/goals", authMiddleware, getGoalsWithProgress);
router.put("/goals/:id", authMiddleware, updateGoal);
router.delete("/goals/:id", authMiddleware, deleteGoal);

module.exports = router;
