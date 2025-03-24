const Transaction = require('../models/Transaction');
const User = require('../models/User');
const convertCurrency = require('../utils/currencyConverter');


// Add new transaction with currency conversion
const addTransaction = async (req, res) => {
    try {
      const { amount, currency = 'LKR', ...rest } = req.body;
  
      let convertedAmountLKR = amount;
  
      // Convert if currency is not LKR
      if (currency !== 'LKR') {
        convertedAmountLKR = await convertCurrency(amount, currency, 'LKR');
        convertedAmountLKR = parseFloat(convertedAmountLKR.toFixed(2)); 
      } else {
        convertedAmountLKR = parseFloat(amount.toFixed(2)); 
      }
  
      const transactionData = {
        user: req.user._id,
        amount,
        currency,
        convertedAmountLKR,
        ...rest
      };
  
      const transaction = await Transaction.create(transactionData);
  
      res.status(201).json(transaction);
  
    } catch(err){
    //   console.error(err.message);
      res.status(500).json({ error:'Server Error' });
    }
  };
  

//get user transactions with optional tag filtering
const getTransactions = async (req, res) => {
    try {
        const { tags } = req.query; 

        let filter = { user: req.user._id };

        if (tags) {
            const tagList = tags.split(',').map(tag => tag.trim());
            filter.tags = { $in: tagList };
        }

        const transactions = await Transaction.find(filter).sort({ date: -1 });
        res.json(transactions);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

//update transactions
const updateTransactions = async (req, res) => {
    try {
      let transaction = await Transaction.findById(req.params.id);
  
      if (!transaction)
        return res.status(404).json({ msg: 'Transaction not found' });
  
      if (transaction.user.toString() !== req.user._id.toString())
        return res.status(403).json({ msg: 'Not authorized' });
  
      const { amount, currency = 'LKR', ...rest } = req.body;
  
      let convertedAmountLKR = amount;
  
      // Convert currency if needed
      if (currency !== 'LKR') {
        convertedAmountLKR = await convertCurrency(amount, currency, 'LKR');
        convertedAmountLKR = parseFloat(convertedAmountLKR.toFixed(2));
      } else {
        convertedAmountLKR = parseFloat(amount.toFixed(2));
      }
  
      const updatedData = {
        amount,
        currency,
        convertedAmountLKR,
        ...rest
      };
  
      transaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        { $set: updatedData },
        { new: true }
      );
  
      res.json(transaction);
  
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
    }
  };

//delete transactions
const deleteTransactions = async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
        
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await Transaction.findByIdAndDelete(req.params.id);
        
        res.json({ msg: 'Transaction removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get upcoming recurring transactions within next days
const getUpcomingRecurringTransactions = async (req, res) => {
    try {
        const daysAhead = parseInt(req.query.days) || 7;
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + daysAhead);

        const recurringTransactions = await Transaction.find({
            user: req.user._id,
            isRecurring: true,
            recurrenceEndDate: { $gte: today }
        });

        // Filter transactions based on recurrence pattern
        const upcomingTransactions = recurringTransactions.filter(transaction => {
            let nextOccurrence = new Date(transaction.date);
            while (nextOccurrence <= endDate) {
                if (nextOccurrence >= today && nextOccurrence <= endDate) {
                    return true;
                }
                switch (transaction.recurrencePattern) {
                    case 'daily':
                        nextOccurrence.setDate(nextOccurrence.getDate() + 1);
                        break;
                    case 'weekly':
                        nextOccurrence.setDate(nextOccurrence.getDate() + 7);
                        break;
                    case 'monthly':
                        nextOccurrence.setMonth(nextOccurrence.getMonth() + 1);
                        break;
                    case 'yearly':
                        nextOccurrence.setFullYear(nextOccurrence.getFullYear() + 1);
                        break;
                }
            }
            return false;
        });

        res.json(upcomingTransactions);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get all transactions (Admin)
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({})
            .populate('user', 'name email')
            .sort({ date: -1 });

        res.json(transactions);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Generate spending report (Admin)
const getComprehensiveReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const spendingByCategory = await Transaction.aggregate([
            { $match: { date: { $gte: start, $lte: end }, type: 'expense' }},
            { $group: { _id: '$category', totalSpent: { $sum: '$convertedAmountLKR' }}}
        ]);

        const incomeVsExpense = await Transaction.aggregate([
            { $match: { date: { $gte: start, $lte: end }}},
            { $group: { _id: '$type', totalAmount: { $sum: '$convertedAmountLKR' }}}
        ]);

        const totalUsers = await User.countDocuments();

        res.json({
            spendingByCategory,
            incomeVsExpense,
            totalUsers
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server Error' });
    }
};


module.exports = {
    getTransactions,
    addTransaction,
    updateTransactions,
    deleteTransactions,
    getAllTransactions,
    getComprehensiveReport,
    getUpcomingRecurringTransactions
}