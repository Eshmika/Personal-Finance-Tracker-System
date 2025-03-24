const Transaction = require('../models/Transaction');

// Get spending trends report using convertedAmountLKR
const getSpendingTrends = async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate, categories, tags } = req.query;

        const start = new Date(startDate);
        const end = new Date(endDate);

        let filter = {
            user: userId,
            date: { $gte: start, $lte: end }
        };

        if (categories) {
            const categoryList = categories.split(',').map(cat => cat.trim());
            filter.category = { $in: categoryList };
        }

        if (tags) {
            const tagList = tags.split(',').map(tag => tag.trim());
            filter.tags = { $in: tagList };
        }

        // Fetch transactions based on filters
        const transactions = await Transaction.find(filter).sort({ date: 1 });

        // Spending by Category (using convertedAmountLKR)
        const spendingByCategory = await Transaction.aggregate([
            { $match: { 
                user: userId,
                date: { $gte: start, $lte: end },
                type: 'expense',
                ...(categories && { category: { $in: categories.split(',') } }),
                ...(tags && { tags: { $in: tags.split(',') } })
            }},
            { $group: {
                _id: '$category',
                totalSpentLKR: { $sum: '$convertedAmountLKR' } 
            }}
        ]);

        // Income vs Expense summary (using convertedAmountLKR)
        const incomeVsExpense = await Transaction.aggregate([
            { $match: {
                user: userId,
                date: { $gte: start, $lte: end }
            }},
            { $group: {
                _id: '$type',
                totalAmountLKR: { $sum: '$convertedAmountLKR' } 
            }}
        ]);

        res.status(200).json({
            transactions,
            spendingByCategory,
            incomeVsExpense
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getSpendingTrends
};
