const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Banner = require('../models/Banner');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Ensure the folder for banner images exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'banner');
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

// Fetch all banner images
router.get('/banner-images', async (req, res) => {
  try {
    const banner = await Banner.findOne();
    if (!banner) return res.status(200).json({ images: [] });
    res.status(200).json(banner.images);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Add a new image
router.post('/banner-images', upload.single('image'), async (req, res) => {
  try {
    const banner = await Banner.findOne() || new Banner();

    if (banner.images.length >= 3) {
      return res.status(400).json({ error: 'Maximum of 3 images allowed' });
    }

    const newImage = {
      imageId: uuidv4(),
      url: `uploads/banner/${req.file.filename}`
    };

    banner.images.push(newImage);
    await banner.save();

    res.status(201).json({ message: 'Image added successfully', image: newImage });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Replace an existing image
router.put('/banner-images/:imageId', upload.single('image'), async (req, res) => {
  try {
    const { imageId } = req.params;
    const banner = await Banner.findOne();
    if (!banner) return res.status(404).json({ error: 'Banner not found' });

    const imageIndex = banner.images.findIndex(img => img.imageId === imageId);
    if (imageIndex === -1) return res.status(404).json({ error: 'Image not found' });

    // Delete the old image from the file system
    const oldImagePath = path.join(__dirname, '..', banner.images[imageIndex].url);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }

    const updatedImage = {
      imageId: imageId,
      url: `uploads/banner/${req.file.filename}`
    };

    banner.images[imageIndex] = updatedImage;
    await banner.save();

    res.status(200).json({ message: 'Image replaced successfully', image: updatedImage });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Delete an image
router.delete('/banner-images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const banner = await Banner.findOne();
    if (!banner) return res.status(404).json({ error: 'Banner not found' });

    const imageIndex = banner.images.findIndex(img => img.imageId === imageId);
    if (imageIndex === -1) return res.status(404).json({ error: 'Image not found' });

    // Delete the image from the file system
    const imagePath = path.join(__dirname, '..', banner.images[imageIndex].url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    banner.images.splice(imageIndex, 1);
    await banner.save();

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
