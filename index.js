const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Database not connected', err));

// Routes
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/transactionRoutes'));
app.use('/', require('./routes/budgetRoutes'));
app.use('/', require('./routes/reportRoutes'));
app.use('/', require('./routes/adminRoutes'));
app.use('/', require('./routes/goalRoutes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
