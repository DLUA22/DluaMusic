const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  youtubeId: { type: String, required: true, unique: true },
  title: { type: String, required: true, index: true }, 
  channelTitle: { type: String, required: true },
  thumbnail: { type: String, required: true },
  searchKeyword: { type: String, required: true, index: true } 
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);