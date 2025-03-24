const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: String, required: true }, 
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  targetDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const GoalModel = mongoose.model('Goal', GoalSchema);

module.exports = GoalModel;
