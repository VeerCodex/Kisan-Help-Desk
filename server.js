const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Query = require('./models/Query');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kisan_help_desk';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// MongoDB Connection & In-Memory Fallback
let isMongoConnected = false;
const inMemoryUsers = [];
const inMemoryQueries = [];

mongoose.connect(MONGO_URI)
  .then(() => {
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Database successfully!');
  })
  .catch(err => {
    isMongoConnected = false;
    console.log('---------------------------------------------------------');
    console.log('⚠️ Local MongoDB service not detected on port 27017.');
    console.log('💡 Running in [In-Memory Mode] - Registration & Signin will work for local testing!');
    console.log('📌 To connect to Cloud DB, paste your MongoDB Atlas URI in the .env file.');
    console.log('---------------------------------------------------------');
  });

// --- API ROUTES ---

// 1. Farmer Registration API
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, password, mobile, address, age, sex, email } = req.body;

    if (!fullName || !password || !mobile || !address || !age || !sex) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimum 6 characters.' });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number.' });
    }

    if (isMongoConnected) {
      const existingUser = await User.findOne({ mobile });
      if (existingUser) {
        return res.status(400).json({ message: 'Mobile number is already registered.' });
      }

      const newUser = new User({
        fullName,
        password,
        mobile,
        address,
        age: Number(age),
        sex,
        email: email || null
      });

      await newUser.save();
      return res.status(201).json({ message: 'Account created successfully in MongoDB database!' });
    } else {
      // In-Memory Mode
      const existingUser = inMemoryUsers.find(u => u.mobile === mobile);
      if (existingUser) {
        return res.status(400).json({ message: 'Mobile number is already registered.' });
      }

      const newUser = {
        _id: String(Date.now()),
        fullName,
        password,
        mobile,
        address,
        age: Number(age),
        sex,
        email: email || null,
        createdAt: new Date()
      };

      inMemoryUsers.push(newUser);
      return res.status(201).json({ message: 'Account created successfully (In-Memory Testing Mode)!' });
    }
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

    if (isMongoConnected) {
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
          address: user.address,
          age: user.age,
          sex: user.sex,
          email: user.email
        }
      });
    } else {
      // In-Memory Mode
      const user = inMemoryUsers.find(u => u.mobile === mobile && u.password === password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid mobile number or password.' });
      }

      return res.status(200).json({
        message: 'Login successful!',
        user: {
          id: user._id,
          fullName: user.fullName,
          mobile: user.mobile,
          address: user.address,
          age: user.age,
          sex: user.sex,
          email: user.email
        }
      });
    }
  } catch (err) {
    console.error('Signin Error:', err);
    return res.status(500).json({ message: 'Server error during sign in.' });
  }
});

// 3. Submit Query API
app.post('/api/query', async (req, res) => {
  try {
    const { name, mobile, cropType, queryText } = req.body;
    if (!name || !mobile || !queryText) {
      return res.status(400).json({ message: 'Name, mobile, and query text are required.' });
    }

    if (isMongoConnected) {
      const newQuery = new Query({ name, mobile, cropType: cropType || 'General', queryText });
      await newQuery.save();
    } else {
      inMemoryQueries.push({ name, mobile, cropType: cropType || 'General', queryText, createdAt: new Date() });
    }

    return res.status(201).json({ message: 'Query submitted successfully!' });
  } catch (err) {
    console.error('Query Error:', err);
    return res.status(500).json({ message: 'Server error submitting query.' });
  }
});

// Serve frontend index.html for unmatched routes
app.get('*', (req, res) => {
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|json)$/i)) {
    return res.status(404).send('Asset file not found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Kisan Help Desk Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel Serverless Function
module.exports = app;

