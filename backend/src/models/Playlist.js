const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  songs: { 
    type: Array, 
    default: [] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);