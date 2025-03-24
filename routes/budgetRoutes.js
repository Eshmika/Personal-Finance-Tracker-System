const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authToken");
const {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

router.post("/addbudget", authMiddleware, addBudget);
router.get("/getbudgets", authMiddleware, getBudgets);
router.put("/updatebudget/:id", authMiddleware, updateBudget);
router.delete("/deletebudget/:id", authMiddleware, deleteBudget);

module.exports = router;
