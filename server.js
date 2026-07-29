const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Query = require('./models/Query');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kisan_help_desk';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (index.html, CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch(err => {
    console.warn('⚠️ Could not connect to MongoDB:', err.message);
    console.warn('💡 Tip: Ensure local MongoDB service is running OR update MONGO_URI in .env to point to MongoDB Atlas Cloud.');
  });

// --- API ROUTES ---

// 1. Farmer Registration API
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, password, mobile, address, age, sex, email } = req.body;

    // Validation
    if (!fullName || !password || !mobile || !address || !age || !sex) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Mobile number must be a valid 10-digit number.' });
    }

    // Check existing user
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: 'Mobile number is already registered.' });
    }

    // Create user
    const newUser = new User({
      fullName,
      password, // In production, hash with bcrypt
      mobile,
      address,
      age: Number(age),
      sex,
      email: email || null
    });

    await newUser.save();
    return res.status(201).json({ message: 'Account created successfully in MongoDB database!' });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ message: 'Server error while creating account.' });
  }
});

// 2. Farmer Sign-In API
app.post('/api/signin', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ message: 'Please provide mobile and password.' });
    }

    const user = await User.findOne({ mobile, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid mobile number or password.' });
    }

    return res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user._id,
        fullName: user.fullName,
        mobile: user.mobile,
        address: user.address
      }
    });
  } catch (err) {
    console.error('Signin Error:', err);
    return res.status(500).json({ message: 'Server error during sign in.' });
  }
});

// 3. Submit Help Desk Query API
app.post('/api/query', async (req, res) => {
  try {
    const { name, mobile, cropType, queryText } = req.body;

    if (!name || !mobile || !queryText) {
      return res.status(400).json({ message: 'Name, mobile, and query text are required.' });
    }

    const newQuery = new Query({
      name,
      mobile,
      cropType: cropType || 'General',
      queryText
    });

    await newQuery.save();
    return res.status(201).json({ message: 'Query submitted successfully!' });
  } catch (err) {
    console.error('Query Error:', err);
    return res.status(500).json({ message: 'Server error while submitting query.' });
  }
});

// 4. Fetch All Queries (For Admin / Dashboard)
app.get('/api/queries', async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    return res.status(200).json(queries);
  } catch (err) {
    console.error('Fetch Queries Error:', err);
    return res.status(500).json({ message: 'Server error fetching queries.' });
  }
});

// Serve frontend for all unmatched GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Kisan Help Desk Server running on http://localhost:${PORT}`);
});
