const mongoose = require('mongoose');

const SystemSettingSchema = new mongoose.Schema({
    categories: [{ type: String }],
    limits: {
        dailyTransactionLimit: Number,
        monthlyBudgetLimit: Number
    },
    updatedAt: { type: Date, default: Date.now }
});

const SystemSettingModel = mongoose.model('SystemSetting', SystemSettingSchema);

module.exports = SystemSettingModel;