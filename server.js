require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const auth = require('./src/middleware/auth');

// Use local file DB when USE_LOCAL_DB=true in .env (convenient for offline/dev)
let connectDB = null;
let DatabaseService = null;
if (process.env.USE_LOCAL_DB === 'true') {
  // lowdb-based local JSON persistence
  DatabaseService = require('./src/db/localDb');
  console.log('Using local JSON DB (USE_LOCAL_DB=true)');
} else {
  // default: use mongoose-backed service
  connectDB = require('./src/db/config');
  DatabaseService = require('./src/db/service');
  // Connect to MongoDB
  connectDB();
}

const app = express();


// Dev-only debug route to inspect DB connection (safe to remove in prod)
app.get('/api/debug/db', (req, res) => {
  try {
    if (process.env.USE_LOCAL_DB === 'true') {
      // Local DB is file-based; surface a simple status
      return res.json({ ok: true, usingLocalDb: true });
    }

    const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
    const host = mongoose.connection.host || null;
    const name = mongoose.connection.name || null;
    res.json({ ok: true, state, host, name });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Authentication routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await DatabaseService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await DatabaseService.createUser({
      name,
      email,
      password: hashedPassword
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

  // Remove password from response (support mongoose doc or plain object)
  const userResponse = typeof user.toObject === 'function' ? user.toObject() : Object.assign({}, user);
  if (userResponse && userResponse.password) delete userResponse.password;

    res.status(201).json({
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Signup route error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response (support mongoose doc or plain object)
    const userResponse = typeof user.toObject === 'function' ? user.toObject() : Object.assign({}, user);
    if (userResponse && userResponse.password) delete userResponse.password;

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Protected User routes
app.post('/api/users', auth, async (req, res) => {
  try {
    const user = await DatabaseService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Create user route error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await DatabaseService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user route error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await DatabaseService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Update user route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Assessment routes
app.post('/api/assessments', async (req, res) => {
  try {
    const assessment = await DatabaseService.createAssessment(req.body);
    res.status(201).json(assessment);
  } catch (error) {
    console.error('Create assessment route error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:userId/assessments', async (req, res) => {
  try {
    const assessments = await DatabaseService.getAssessmentsByUserId(req.params.userId);
    res.json(assessments);
  } catch (error) {
    console.error('Get assessments route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Portfolio routes
app.post('/api/portfolios', async (req, res) => {
  try {
    const portfolio = await DatabaseService.createPortfolio(req.body);
    res.status(201).json(portfolio);
  } catch (error) {
    console.error('Create portfolio route error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:userId/portfolios', async (req, res) => {
  try {
    const portfolios = await DatabaseService.getPortfoliosByUserId(req.params.userId);
    res.json(portfolios);
  } catch (error) {
    console.error('Get portfolios route error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});