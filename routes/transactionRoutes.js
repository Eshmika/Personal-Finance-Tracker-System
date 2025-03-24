const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authToken');
const adminAuth = require("../middleware/adminAuth");
const {
  addTransaction,
  getTransactions,
  updateTransactions,
  deleteTransactions,
  getAllTransactions,
  getComprehensiveReport,
  getUpcomingRecurringTransactions
} = require("../controllers/transactionController");

router.post("/addtransactions", authMiddleware, addTransaction);
router.get("/gettransactions", authMiddleware, getTransactions);
router.put("/updatetransactions/:id", authMiddleware, updateTransactions);
router.delete("/deletetransactions/:id", authMiddleware, deleteTransactions);
router.get("/getalltransactions", adminAuth, getAllTransactions);
router.get("/getreport", adminAuth, getComprehensiveReport);
router.get("/getupcomingrecurringtransactions", authMiddleware, getUpcomingRecurringTransactions);

module.exports = router;
