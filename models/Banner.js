const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  images: [{
    imageId: { type: String, required: true },
    url: { type: String, required: true }
  }]
});

module.exports = mongoose.model('Banner', BannerSchema);
