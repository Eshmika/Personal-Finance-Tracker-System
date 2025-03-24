const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "LKR" },
  convertedAmountLKR: { type: Number, required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  tags: [{ type: String }],
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: {
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly"],
  },
  recurrenceEndDate: { type: Date },
});

const TransactionModel = mongoose.model("Transaction", TransactionSchema);

module.exports = TransactionModel;
