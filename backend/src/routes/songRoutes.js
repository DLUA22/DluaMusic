const express = require('express');
const router = express.Router();
const { searchSongs } = require('../controllers/songController');

router.get('/search', searchSongs);

module.exports = router;