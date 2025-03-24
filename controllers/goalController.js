const Goal = require("../models/Goal");
const Transaction = require("../models/Transaction");

// Add new goal
const addGoal = async (req, res) => {
  try {
    const newGoal = await Goal.create({
      user: req.user._id,
      ...req.body,
    });

    res.status(201).json(newGoal);
  } catch (err) {
    // console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get user's goals with savings progress
const getGoalsWithProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const goals = await Goal.find({ user: userId });

    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        // Fetch total saved amount from transactions tagged as savings for this goal
        const savingsTransactions = await Transaction.aggregate([
          {
            $match: {
              user: userId,
              type: "income",
              tags: goal.category, // assuming goal.category matches transaction tags
              date: { $gte: goal.startDate, $lte: new Date() },
            },
          },
          { $group: { _id: null, totalSaved: { $sum: "$amount" } } },
        ]);

        const totalSaved = savingsTransactions[0]?.totalSaved || 0;
        const progressPercentage = Math.min(
          (totalSaved / goal.amount) * 100,
          100
        );

        return {
          goal,
          totalSaved: savingsTransactions[0]?.totalSaved || 0,
          progressPercentage,
        };
      })
    );

    res.json(goalsWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Update existing goal
const updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!goal) return res.status(404).json({ error: "Goal not found" });

    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Delete goal
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) return res.status(404).json({ error: "Goal not found" });

    res.json({ msg: "Goal removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addGoal,
  getGoalsWithProgress,
  updateGoal,
  deleteGoal,
};
