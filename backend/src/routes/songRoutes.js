const express = require('express');
const router = express.Router();

const { searchSongs, getSmartRecommendation, getTrendingSongs } = require('../controllers/songController');

router.get('/search', searchSongs);
router.get('/recommend', getSmartRecommendation);
router.get('/trending', getTrendingSongs);

module.exports = router;