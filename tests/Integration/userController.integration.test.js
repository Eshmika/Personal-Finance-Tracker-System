const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');
const authRoutes = require('../../routes/authRoutes');
const { hashPassword } = require('../../middleware/authHashpassword');

// Mock hashPassword function
jest.mock('../../middleware/authHashpassword', () => ({
  hashPassword: jest.fn().mockImplementation(pwd => `hashed_${pwd}`),
  comparePassword: jest.fn()
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/', authRoutes);

describe('User Registration Integration Tests', () => {
  let mongoServer;
  
  beforeAll(async () => {
    // Create an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });
  
  afterAll(async () => {
    // Disconnect and stop MongoDB server
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
//   beforeEach(async () => {
//     // Clear the database before each test
//     await User.deleteMany({});
//   });
  
  test('should register a new user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      contactnumber: 1234567890,
      address: '123 Test Street',
      role: 'user'
    };
    
    const response = await request(app)
      .post('/register')
      .send(userData);
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('_id');
    expect(response.body.user.email).toBe(userData.email);
    
    // Verify user was saved to the database
    const savedUser = await User.findOne({ email: userData.email });
    expect(savedUser).not.toBeNull();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.password).toBe(`hashed_${userData.password}`);
  });
  
  test('should return error when required fields are missing', async () => {
    const userData = {
      email: 'incomplete@example.com',
      password: 'password123'
      // Missing name, contactnumber, and address
    };
    
    const response = await request(app)
      .post('/register')
      .send(userData);
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('error', 'Name is required');
    
  });
  
  test('should return error when password is too short', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'short', // Less than 6 characters
      contactnumber: 1234567890,
      address: '123 Test Street',
      role: 'user'
    };
    
    const response = await request(app)
      .post('/register')
      .send(userData);
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('error', 'Password is required and should be minimum 6 characters long');
    
  });
  
});
