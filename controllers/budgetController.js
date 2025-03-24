const Budget = require('../models/Budget');

// Add new budget
const addBudget = async (req, res) => {
    try {
        const newBudget = await Budget.create({
            user: req.user._id,
            ...req.body
        });

        res.status(201).json(newBudget);
        
    } catch (err) {
        // console.error(err);
        res.status(500).json({ error: err.message });
    }
};

//Get all budgets for a user
const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user._id });
        res.json(budgets);
        
    } catch (err) {
        // console.error(err);
        res.status(500).json({ error: err.message });
    }
};

//Update budget
const updateBudget = async (req, res) => {
    try {
        let budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });

        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        budget = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.json(budget);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

//Delete budget
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });

        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.json({ msg: 'Budget removed' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


module.exports = {
    addBudget,
    getBudgets,
    updateBudget,
    deleteBudget
}