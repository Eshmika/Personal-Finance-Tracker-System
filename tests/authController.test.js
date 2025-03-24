const request = require('supertest');
const express = require('express');
const User = require('../models/User');
const { hashPassword } = require('../middleware/authHashpassword');
const authRoutes = require('../routes/authRoutes');

// Mock dependencies
jest.mock('../models/User');
jest.mock('../middleware/authHashpassword');

// Set up Express app for testing
const app = express();
app.use(express.json());
app.use('/', authRoutes);

describe('Auth Controller - registerUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register a new user successfully', async () => {
    const userPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      contactnumber: '1234567890',
      address: '123 Main St',
      role: 'user'
    };

    // Mock User.findOne to return null (email not already in use)
    User.findOne.mockResolvedValue(null);

    // Mock hashPassword to return a hashed password
    hashPassword.mockResolvedValue('hashed_password');

    // Mock User.create to return the created user object
    User.create.mockResolvedValue({
      _id: 'user123',
      ...userPayload,
      password: 'hashed_password'
    });

    const response = await request(app)
      .post('/register')
      .send(userPayload);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
      contactnumber: '1234567890',
      address: '123 Main St',
      role: 'user'
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
    expect(hashPassword).toHaveBeenCalledWith('password123');
    expect(User.create).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      contactnumber: '1234567890',
      address: '123 Main St',
      role: 'user'
    });
  });

  test('should return error if email is already in use', async () => {
    const userPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      contactnumber: '1234567890',
      address: '123 Main St',
      role: 'user'
    };

    // Mock User.findOne to return an existing user
    User.findOne.mockResolvedValue({ _id: 'existing_user' });

    const response = await request(app)
      .post('/register')
      .send(userPayload);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('error', 'Email is already in use');
    expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
  });

  test('should return validation errors for missing fields', async () => {
    const userPayload = {
      email: '',
      password: '',
      contactnumber: '',
      address: '',
      role: ''
    };

    const response = await request(app)
      .post('/register')
      .send(userPayload);

    expect(response.status).toBe(200);
    expect(response.body.error).toBeDefined();
  });

});
