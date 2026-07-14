const Playlist = require('../models/Playlist');

// 1. TẠO PLAYLIST MỚI
const createPlaylist = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newPlaylist = new Playlist({
      userId: req.user.id,
      title: title || 'Playlist mới của tôi',
      description: description || ''
    });
    await newPlaylist.save();
    res.status(201).json({ success: true, playlist: newPlaylist });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo playlist' });
  }
};

// 2. LẤY TẤT CẢ PLAYLIST CỦA USER
const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, playlists });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải playlist' });
  }
};

// 3. THÊM / RÚT BÀI HÁT KHỎI PLAYLIST (Nhấn dấu + chọn)
const toggleSongInPlaylist = async (req, res) => {
  try {
    const { playlistId, song } = req.body;
    const playlist = await Playlist.findOne({ _id: playlistId, userId: req.user.id });
    if (!playlist) return res.status(404).json({ message: 'Không tìm thấy Playlist' });
    const songIndex = playlist.songs.findIndex(s => s.youtubeId === song.youtubeId);   
    if (songIndex > -1) {
      playlist.songs.splice(songIndex, 1); 
    } else {
      playlist.songs.push(song); 
    }

    await playlist.save();
    res.status(200).json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật bài hát vào playlist' });
  }
};

// 4. XÓA HOÀN TOÀN PLAYLIST
const deletePlaylist = async (req, res) => {
  try {
    await Playlist.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.status(200).json({ success: true, message: 'Đã xóa playlist' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa playlist' });
  }
};

module.exports = { createPlaylist, getPlaylists, toggleSongInPlaylist, deletePlaylist };