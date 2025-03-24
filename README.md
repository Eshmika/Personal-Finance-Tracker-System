# Personal Finance Tracker System

## Overview
The Personal Finance Tracker RESTful API allows users to securely manage their financial records, track expenses, set budgets, and analyze spending trends. Built using Express.js (Node.js) , it integrates with MongoDB to store and manage data for users, transactions, budgets, and reports. The API ensures secure access through JWT-based authentication and role-based authorization. It adheres to software development best practices to deliver clean, maintainable, and scalable code. The system provides essential features like CRUD operations for transactions and budgets, notifications for budget limits, and detailed financial reports for spending analysis.

## Technologies Used
- *Backend:* Express.js (Node.js)
- *Database:* MongoDB
- *Authentication:* JWT (JSON Web Tokens)
- *Unit Testing:* Jest 
- *Security Testing:* OWASP ZAP 
- *Performance Testing:* Artillery.io

## Installation

### Install dependencies

```bash
  npm install
```


### Run the application

```bash
  npm start
```

## API Documentation

### *User Authentication*
- POST /register - Register a new user
- POST /login - User login
- GET /profile - Get user profile

### *Admin*
- GET /users - Get all users
- GET /users/:id - Get users by id
- PUT /users/:id - Update users by id
- POST /users - Create users
- DELETE /users/:id - Delete users by id
- GET /settings - Get System Settings
- PUT /settings - Update System Settings

### *Transactions*
- POST /addtransactions - Create a transaction
- GET /gettransactions - List transactions with filters
- GET /getupcomingrecurringtransactions - Get Upcoming Recurring Transactions
- GET /getalltransactions - Get All Transaction (Admin)
- GET /getreport?startDate=2025-03-01&endDate=2025-04-30 - Get All Report By Date Range(Admin)
- PUT /updatetransactions/:id - Update a transaction
- DELETE /deletetransactions/:id - Delete a transaction

### *Budget*
- POST /addbudget - Set a budget
- GET /getbudgets - List all budgets
- PUT /updatebudget/:id - Update a budget
- DELETE /deletebudget/:id - Remove a budget

### *Goals*
- POST /goals - Create a goal
- GET /goals - Get Goals With Progress
- PUT /goals/:id - Update goal progress
- DELETE /goals/:id - Remove goal

### *Report*
- GET /getspendingtrends?startDate=2025-03-01&endDate=2025-04-30 - Get Report By Date Range with with filters


## Testing

```bash
  npm test
```