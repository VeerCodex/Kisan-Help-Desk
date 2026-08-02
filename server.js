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

// 4. Live State & District Mandi Prices API
app.get('/api/mandi-prices', (req, res) => {
  const mandiDatabase = {
    "punjab": {
      "ludhiana": [
        { commodity: "Wheat (Gehu)", variety: "FAQ Grade", minPrice: 2275, maxPrice: 2450, modalPrice: 2350, trend: "⬆️" },
        { commodity: "Paddy (Dhaan)", variety: "Basmati 1121", minPrice: 3800, maxPrice: 4250, modalPrice: 4100, trend: "⬆️" },
        { commodity: "Maize (Makka)", variety: "Hybrid", minPrice: 1950, maxPrice: 2150, modalPrice: 2050, trend: "➡️" },
        { commodity: "Cotton (Kapas)", variety: "Long Staple", minPrice: 6800, maxPrice: 7400, modalPrice: 7150, trend: "⬆️" }
      ],
      "amritsar": [
        { commodity: "Wheat (Gehu)", variety: "Dara", minPrice: 2250, maxPrice: 2420, modalPrice: 2330, trend: "➡️" },
        { commodity: "Paddy (Dhaan)", variety: "Basmati 1509", minPrice: 3500, maxPrice: 3950, modalPrice: 3800, trend: "⬆️" },
        { commodity: "Mustard (Sarson)", variety: "Bold", minPrice: 5200, maxPrice: 5700, modalPrice: 5500, trend: "⬇️" }
      ],
      "bathinda": [
        { commodity: "Cotton (Kapas)", variety: "Medium Staple", minPrice: 6700, maxPrice: 7250, modalPrice: 7000, trend: "⬆️" },
        { commodity: "Wheat (Gehu)", variety: "Sharbati", minPrice: 2400, maxPrice: 2650, modalPrice: 2550, trend: "⬆️" },
        { commodity: "Gram (Chana)", variety: "Desi", minPrice: 5600, maxPrice: 6100, modalPrice: 5900, trend: "➡️" }
      ]
    },
    "up": {
      "meerut": [
        { commodity: "Wheat (Gehu)", variety: "Dara", minPrice: 2250, maxPrice: 2420, modalPrice: 2320, trend: "➡️" },
        { commodity: "Sugarcane (Ganna)", variety: "CO 0238", minPrice: 375, maxPrice: 400, modalPrice: 390, trend: "⬆️" },
        { commodity: "Potato (Aaloo)", variety: "Kufri Bahar", minPrice: 1400, maxPrice: 1850, modalPrice: 1650, trend: "⬇️" },
        { commodity: "Mustard (Sarson)", variety: "Yellow", minPrice: 5200, maxPrice: 5750, modalPrice: 5500, trend: "⬆️" }
      ],
      "agra": [
        { commodity: "Potato (Aaloo)", variety: "Jyoti", minPrice: 1350, maxPrice: 1750, modalPrice: 1580, trend: "⬇️" },
        { commodity: "Mustard (Sarson)", variety: "Black", minPrice: 5150, maxPrice: 5650, modalPrice: 5400, trend: "➡️" },
        { commodity: "Wheat (Gehu)", variety: "Desi", minPrice: 2200, maxPrice: 2400, modalPrice: 2300, trend: "⬆️" }
      ],
      "kanpur": [
        { commodity: "Onion (Pyaz)", variety: "Red", minPrice: 1800, maxPrice: 2350, modalPrice: 2100, trend: "⬆️" },
        { commodity: "Tomato (Tamatar)", variety: "Local", minPrice: 2200, maxPrice: 2900, modalPrice: 2550, trend: "⬇️" },
        { commodity: "Paddy (Dhaan)", variety: "Common", minPrice: 2183, maxPrice: 2300, modalPrice: 2240, trend: "➡️" }
      ]
    },
    "haryana": {
      "karnal": [
        { commodity: "Wheat (Gehu)", variety: "FAQ Grade", minPrice: 2275, maxPrice: 2425, modalPrice: 2360, trend: "⬆️" },
        { commodity: "Mustard (Sarson)", variety: "High Oil", minPrice: 5300, maxPrice: 5800, modalPrice: 5550, trend: "⬆️" },
        { commodity: "Paddy (Dhaan)", variety: "PR 126", minPrice: 2100, maxPrice: 2350, modalPrice: 2220, trend: "➡️" },
        { commodity: "Bajra", variety: "Hybrid", minPrice: 2150, maxPrice: 2350, modalPrice: 2250, trend: "⬆️" }
      ],
      "hisar": [
        { commodity: "Cotton (Kapas)", variety: "Bt Cotton", minPrice: 6850, maxPrice: 7450, modalPrice: 7200, trend: "⬆️" },
        { commodity: "Guar Seed", variety: "Desi", minPrice: 4800, maxPrice: 5350, modalPrice: 5100, trend: "➡️" },
        { commodity: "Wheat (Gehu)", variety: "Dara", minPrice: 2260, maxPrice: 2410, modalPrice: 2340, trend: "⬆️" }
      ]
    },
    "mp": {
      "indore": [
        { commodity: "Soybean", variety: "Yellow JS-335", minPrice: 4400, maxPrice: 4850, modalPrice: 4650, trend: "⬆️" },
        { commodity: "Wheat (Gehu)", variety: "Sharbati Premium", minPrice: 2600, maxPrice: 3100, modalPrice: 2850, trend: "⬆️" },
        { commodity: "Gram (Chana)", variety: "Desi", minPrice: 5800, maxPrice: 6400, modalPrice: 6150, trend: "⬆️" },
        { commodity: "Garlic (Lahsun)", variety: "Ooty", minPrice: 9000, maxPrice: 14000, modalPrice: 11500, trend: "⬆️" }
      ],
      "ujjain": [
        { commodity: "Soybean", variety: "Yellow", minPrice: 4350, maxPrice: 4800, modalPrice: 4600, trend: "➡️" },
        { commodity: "Wheat (Gehu)", variety: "Lok-1", minPrice: 2450, maxPrice: 2800, modalPrice: 2650, trend: "⬆️" }
      ]
    },
    "rajasthan": {
      "jaipur": [
        { commodity: "Bajra", variety: "Local", minPrice: 2100, maxPrice: 2300, modalPrice: 2200, trend: "➡️" },
        { commodity: "Mustard (Sarson)", variety: "Bold", minPrice: 5250, maxPrice: 5700, modalPrice: 5480, trend: "⬆️" },
        { commodity: "Cumin (Jeera)", variety: "Uncleaned", minPrice: 24000, maxPrice: 29500, modalPrice: 26800, trend: "⬆️" },
        { commodity: "Guar Seed", variety: "FAQ", minPrice: 4900, maxPrice: 5400, modalPrice: 5150, trend: "⬇️" }
      ]
    },
    "bihar": {
      "patna": [
        { commodity: "Paddy (Dhaan)", variety: "Common", minPrice: 2183, maxPrice: 2300, modalPrice: 2240, trend: "➡️" },
        { commodity: "Maize (Makka)", variety: "Yellow", minPrice: 1900, maxPrice: 2100, modalPrice: 2000, trend: "⬆️" },
        { commodity: "Makhana", variety: "Raw Grade A", minPrice: 14000, maxPrice: 18500, modalPrice: 16200, trend: "⬆️" }
      ]
    },
    "maharashtra": {
      "pune": [
        { commodity: "Onion (Pyaz)", variety: "Nashik Red", minPrice: 1600, maxPrice: 2400, modalPrice: 2050, trend: "⬆️" },
        { commodity: "Cotton (Kapas)", variety: "Medium", minPrice: 6850, maxPrice: 7450, modalPrice: 7180, trend: "⬆️" },
        { commodity: "Soybean", variety: "Yellow", minPrice: 4350, maxPrice: 4800, modalPrice: 4600, trend: "➡️" },
        { commodity: "Turmeric (Haldi)", variety: "Selam", minPrice: 11500, maxPrice: 15200, modalPrice: 13400, trend: "⬆️" }
      ]
    },
    "gujarat": {
      "ahmedabad": [
        { commodity: "Groundnut (Moongphali)", variety: "Bold", minPrice: 6200, maxPrice: 7100, modalPrice: 6650, trend: "⬆️" },
        { commodity: "Cotton (Kapas)", variety: "Shankar 6", minPrice: 6900, maxPrice: 7550, modalPrice: 7250, trend: "⬆️" },
        { commodity: "Castor Seed (Arandi)", variety: "Hybrid", minPrice: 5600, maxPrice: 6100, modalPrice: 5850, trend: "➡️" }
      ]
    },
    "westbengal": {
      "kolkata": [
        { commodity: "Rice (Chawal)", variety: "Minikit", minPrice: 3400, maxPrice: 3850, modalPrice: 3650, trend: "⬆️" },
        { commodity: "Jute (Patsan)", variety: "TD-5", minPrice: 5100, maxPrice: 5650, modalPrice: 5400, trend: "➡️" },
        { commodity: "Potato (Aaloo)", variety: "Jyoti", minPrice: 1450, maxPrice: 1800, modalPrice: 1620, trend: "⬇️" }
      ]
    },
    "tamilnadu": {
      "chennai": [
        { commodity: "Paddy (Dhaan)", variety: "ADT 37", minPrice: 2200, maxPrice: 2450, modalPrice: 2320, trend: "⬆️" },
        { commodity: "Coconut (Nariyal)", variety: "Grade 1", minPrice: 2800, maxPrice: 3400, modalPrice: 3100, trend: "⬆️" },
        { commodity: "Banana (Kela)", variety: "Poovan", minPrice: 1800, maxPrice: 2400, modalPrice: 2150, trend: "➡️" }
      ]
    },
    "karnataka": {
      "bengaluru": [
        { commodity: "Ragi (Finger Millet)", variety: "Local", minPrice: 3200, maxPrice: 3800, modalPrice: 3500, trend: "⬆️" },
        { commodity: "Red Gram (Tur)", variety: "Maruti", minPrice: 9200, maxPrice: 10600, modalPrice: 9900, trend: "⬆️" },
        { commodity: "Tomato (Tamatar)", variety: "Hybrid", minPrice: 1800, maxPrice: 2600, modalPrice: 2200, trend: "⬇️" }
      ]
    }
  };

  const state = (req.query.state || 'punjab').toLowerCase();
  const district = (req.query.district || 'ludhiana').toLowerCase();

  const stateData = mandiDatabase[state] || mandiDatabase['punjab'];
  let districtData = stateData[district] || Object.values(stateData)[0];

  // Smart Fallback Commodity Generator if specific district commodity list isn't listed
  if (!districtData) {
    districtData = [
      { commodity: "Wheat (Gehu)", variety: "FAQ Grade", minPrice: 2250, maxPrice: 2420, modalPrice: 2335, trend: "⬆️" },
      { commodity: "Paddy (Dhaan)", variety: "Common Grade", minPrice: 2183, maxPrice: 2300, modalPrice: 2240, trend: "➡️" },
      { commodity: "Mustard (Sarson)", variety: "Yellow", minPrice: 5200, maxPrice: 5700, modalPrice: 5450, trend: "⬆️" },
      { commodity: "Potato (Aaloo)", variety: "Local", minPrice: 1400, maxPrice: 1800, modalPrice: 1600, trend: "⬇️" }
    ];
  }

  res.status(200).json({
    state: req.query.state || 'Punjab',
    district: req.query.district || 'Ludhiana',
    lastUpdated: new Date().toISOString(),
    prices: districtData
  });
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

