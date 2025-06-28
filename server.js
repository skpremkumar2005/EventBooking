
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { PORT, FRONTEND_URL } = require('./src/config');
const errorHandler = require('./src/middleware/errorHandler');
const path = require('path');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const eventRoutes = require('./src/routes/eventRoutes');

const app = express();
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use(express.static(path.join(__dirname, '/dist')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '/dist/index.html'));
});

// Global Error Handler - should be the last middleware
app.use(errorHandler);

const port = PORT || 5001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
