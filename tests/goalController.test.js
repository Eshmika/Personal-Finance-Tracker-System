const request = require('supertest');
const express = require('express');
const Goal = require('../models/Goal');

// Mock the Goal model
jest.mock('../models/Goal');

// Create an Express app for testing
const app = express();
app.use(express.json());

// Mock middleware to simulate authenticated user
app.use((req, res, next) => {
  req.user = { _id: 'user123' };
  next();
});

// Import your route handler
const addGoal = require('../controllers/goalController').addGoal;

// Add the route to the test app
app.post('/goals', addGoal);

describe('Goal Controller Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should create a new goal successfully', async () => {
    // Mock the Goal.create method
    Goal.create.mockResolvedValue({
      _id: 'goal123',
      user: 'user123',
      category: 'Vacation',
      amount: 5000,
      startDate: '2025-03-01',
      endDate: '2025-12-31'
    });

    const goalData = {
      category: 'Vacation',
      amount: 5000,
      startDate: '2025-03-01',
      endDate: '2025-12-31'
    };

    const response = await request(app)
      .post('/goals')
      .send(goalData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id', 'goal123');
    expect(response.body).toHaveProperty('user', 'user123');
    expect(Goal.create).toHaveBeenCalledWith({
      user: 'user123',
      ...goalData
    });
  });

  test('should handle errors when goal creation fails', async () => {
    // Mock Goal.create to throw an error
    Goal.create.mockRejectedValue(new Error('Database error'));

    const goalData = {
      category: 'Vacation',
      amount: 5000
    };

    const response = await request(app)
      .post('/goals')
      .send(goalData);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Database error');
  });
});
