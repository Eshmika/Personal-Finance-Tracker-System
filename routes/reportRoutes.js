const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authToken");
const { getSpendingTrends } = require("../controllers/reportController");

router.get("/getspendingtrends", authMiddleware, getSpendingTrends);

module.exports = router;
