const request = require('supertest');
const express = require('express');
const transactionRoutes = require('../routes/transactionRoutes');
const convertCurrency = require('../utils/currencyConverter');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authToken');

// Mock dependencies
jest.mock('../utils/currencyConverter');
jest.mock('../models/Transaction');
jest.mock('../middleware/authToken', () => (req, res, next) => {
    req.user = { _id: 'user123' };
    next();
});

// Set up test app
const app = express();
app.use(express.json());
app.use('/', transactionRoutes);

describe('Transaction Controller - addTransaction', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should add new transaction with currency conversion (non-LKR)', async () => {
        // Mock currency conversion result
        convertCurrency.mockResolvedValue(177384.42);

        // Mock Transaction.create response
        Transaction.create.mockResolvedValue({
            _id: 'transaction123',
            user: 'user123',
            amount: 600,
            currency: 'USD',
            convertedAmountLKR: 177384.42,
            type: 'income',
            category: 'Salary',
            description: 'Freelance payment',
            tags: ['freelance', 'usd'],
            date: new Date('2025-03-10')
        });

        const payload = {
            amount: 600,
            currency: 'USD',
            type: 'income',
            category: 'Salary',
            description: 'Freelance payment',
            tags: ['freelance', 'usd'],
            date: '2025-03-10'
        };

        const response = await request(app)
            .post('/addtransactions')
            .send(payload);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('convertedAmountLKR', 177384.42);
        expect(convertCurrency).toHaveBeenCalledWith(600, 'USD', 'LKR');
        expect(Transaction.create).toHaveBeenCalledWith({
            user: 'user123',
            amount: 600,
            currency: 'USD',
            convertedAmountLKR: 177384.42,
            type: 'income',
            category: 'Salary',
            description: 'Freelance payment',
            tags: ['freelance', 'usd'],
            date: '2025-03-10'
        });
    });

    test('should add new transaction without currency conversion (LKR)', async () => {
        Transaction.create.mockResolvedValue({
            _id: 'transaction456',
            user: 'user123',
            amount: 5000,
            currency: 'LKR',
            convertedAmountLKR: 5000,
            type: 'expense',
            category: 'Food',
            description: 'Grocery shopping',
            tags: ['grocery'],
            date: new Date('2025-03-11')
        });

        const payload = {
            amount: 5000,
            currency: 'LKR',
            type: 'expense',
            category: 'Food',
            description: 'Grocery shopping',
            tags: ['grocery'],
            date: '2025-03-11'
        };

        const response = await request(app)
            .post('/addtransactions')
            .send(payload);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('convertedAmountLKR', 5000);
        expect(convertCurrency).not.toHaveBeenCalled();
        expect(Transaction.create).toHaveBeenCalledWith({
            user: 'user123',
            amount: 5000,
            currency: 'LKR',
            convertedAmountLKR: 5000,
            type: 'expense',
            category: 'Food',
            description: 'Grocery shopping',
            tags: ['grocery'],
            date: '2025-03-11'
        });
    });

    test('should handle errors gracefully', async () => {
        convertCurrency.mockRejectedValue(new Error('Conversion API error'));

        const payload = {
          amount : 100,
          currency : "USD",
          type : "expense",
          category : "Travel"
        };

        const response = await request(app)
          .post('/addtransactions')
          .send(payload);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Server Error');
    });
});
