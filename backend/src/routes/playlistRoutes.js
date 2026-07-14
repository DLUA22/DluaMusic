const express = require('express');
const router = express.Router();
const { createPlaylist, getPlaylists, toggleSongInPlaylist, deletePlaylist } = require('../controllers/playlistController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/', verifyToken, createPlaylist);
router.get('/', verifyToken, getPlaylists);
router.post('/toggle', verifyToken, toggleSongInPlaylist);
router.delete('/:id', verifyToken, deletePlaylist);

module.exports = router;