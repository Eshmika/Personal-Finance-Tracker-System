const request = require('supertest');
const express = require('express');
const Budget = require('../models/Budget');

// Mock the Budget model
jest.mock('../models/Budget');

// Create an Express app for testing
const app = express();
app.use(express.json());

// Mock middleware to simulate authenticated user
app.use((req, res, next) => {
  req.user = { _id: 'user123' };
  next();
});

// Import your route handlers
const { addBudget, getBudgets } = require('../controllers/budgetController');

// Add the routes to the test app
app.post('/addbudget', addBudget);
app.get('/getbudgets', getBudgets);

describe('Budget Controller Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should create a new budget successfully', async () => {
    // Mock the Budget.create method
    Budget.create.mockResolvedValue({
      _id: 'budget123',
      user: 'user123',
      category: 'Food',
      amount: 10000,
      period: 'monthly',
      startDate: '2025-03-01',
      endDate: '2025-03-31'
    });

    const budgetData = {
      category: 'Food',
      amount: 10000,
      period: 'monthly',
      startDate: '2025-03-01',
      endDate: '2025-03-31'
    };

    const response = await request(app)
      .post('/addBudget')
      .send(budgetData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id', 'budget123');
    expect(response.body).toHaveProperty('user', 'user123');
    expect(Budget.create).toHaveBeenCalledWith({
      user: 'user123',
      ...budgetData
    });
  });

  test('should handle errors when budget creation fails', async () => {
    // Mock Budget.create to throw an error
    Budget.create.mockRejectedValue(new Error('Database error'));

    const budgetData = {
      category: 'Food',
      amount: 10000
    };

    const response = await request(app)
      .post('/addBudget')
      .send(budgetData);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Database error');
  });

  test('should get all budgets for a user', async () => {
    // Mock the Budget.find method
    const mockBudgets = [
      { _id: 'budget1', category: 'Food', amount: 10000 },
      { _id: 'budget2', category: 'Transport', amount: 5000 }
    ];
    
    Budget.find.mockResolvedValue(mockBudgets);

    const response = await request(app)
      .get('/getbudgets');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockBudgets);
    expect(Budget.find).toHaveBeenCalledWith({ user: 'user123' });
  });

  test('should handle errors when fetching budgets fails', async () => {
    // Mock Budget.find to throw an error
    Budget.find.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/getbudgets');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Database error');
  });
});
