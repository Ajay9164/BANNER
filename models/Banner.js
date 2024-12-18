const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  imageId: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
