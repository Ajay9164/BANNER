const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bannerRoutes = require('./routes/bannerRoutes');

dotenv.config();  // Load environment variables

const app = express();
const PORT = process.env.PORT || 6000;  // Default to port 6000

// Middleware to parse JSON
app.use(express.json());

// Static folder to serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection failed:', err));

// Routes
app.use('/', bannerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
