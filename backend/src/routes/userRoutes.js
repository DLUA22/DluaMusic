const express = require('express');
const router = express.Router();
const { toggleLikeSong, getLikedSongs } = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/like', verifyToken, toggleLikeSong);
router.get('/liked', verifyToken, getLikedSongs);

module.exports = router;