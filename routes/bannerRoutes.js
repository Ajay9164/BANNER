const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Banner = require('../models/Banner');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/picture/'; // The folder path where images will be saved

    // Ensure the 'uploads/picture' folder exists, create it if not
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating directory:', err);
        return cb(new Error('Failed to create directory'));
      }
      cb(null, uploadPath); // Continue to upload if folder exists or is created
    });
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Create a unique filename to avoid collisions
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png) are allowed'));
    }
  }
});

// POST: Upload an image
router.post('/api/banner-images', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const newBanner = new Banner({
      imageId: req.file.filename,
      url: `picture/${req.file.filename}` // Correct path for the stored image
    });
    await newBanner.save();

    res.status(201).json({
      imageId: newBanner.imageId,
      url: newBanner.url
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save banner' });
  }
});

// GET: Fetch all uploaded images
router.get('/api/banner-images', async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.status(200).json(banners);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// PUT: Replace an existing image
router.put('/api/banner-images/:imageId', upload.single('image'), async (req, res) => {
  const { imageId } = req.params;

  try {
    const banner = await Banner.findOne({ imageId });
    if (!banner) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const oldFilePath = path.join(__dirname, '../uploads/picture/', banner.url);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath); // Delete old file if it exists
    }

    banner.imageId = req.file.filename;
    banner.url = `picture/${req.file.filename}`;
    await banner.save();

    res.status(200).json({
      imageId: banner.imageId,
      url: banner.url
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to replace image' });
  }
});

// DELETE: Delete an image
router.delete('/api/banner-images/:imageId', async (req, res) => {
  const { imageId } = req.params;

  try {
    const banner = await Banner.findOne({ imageId });
    if (!banner) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const filePath = path.join(__dirname, '../uploads/picture/', banner.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete file from disk
    }

    await Banner.deleteOne({ imageId });

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
