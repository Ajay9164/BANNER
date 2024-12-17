const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const Banner = require('./models/Banner');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();  // Load environment variables from .env

// Initialize express app
const app = express();

// Use CORS middleware
app.use(cors());

// MongoDB connection
const mongoURI = process.env.MONGO_URI;  // Read Mongo URI from environment
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Ensure the 'uploads/banner' folder exists
const uploadDir = path.join(__dirname, 'uploads', 'banner');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Directory uploads/banner created!');
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save to the 'uploads/banner' folder
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + '-' + file.originalname); // Generate a unique file name
  }
});

const upload = multer({ storage: storage });

// Body parsing middleware (optional for handling JSON or form-data)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const bannerRoutes = require('./routes/bannerRoutes');
app.use('/api', bannerRoutes);

// Start server on port 6000
const PORT = 6000; // Hardcoded port
app.listen(6000, () => {
  console.log('Server running on port 6000');
});
