const User = require('../models/User');
const Song = require('../models/Song');

const toggleLikeSong = async (req, res) => {
  try {
    // 1. Nhận THÊM thông tin chi tiết của bài hát từ Frontend gửi lên
    const { youtubeId, title, thumbnail, channelTitle, duration } = req.body;
    const userId = req.user.id; 
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    // 2. THAO TÁC QUAN TRỌNG: NHẬP KHO BÀI HÁT
    await Song.findOneAndUpdate(
      { youtubeId: youtubeId }, 
      { 
        youtubeId: youtubeId,
        title: title || 'Chưa rõ tên bài hát',
        thumbnail: thumbnail || '',
        channelTitle: channelTitle || 'Unknown Artist',
        duration: duration || '0:00'
      },
      { upsert: true, new: true } 
    );

    // 3. Logic Thả tim/Bỏ tim (Giữ nguyên của bạn)
    const isLiked = user.likedSongs.includes(youtubeId);
    if (isLiked) {
      user.likedSongs = user.likedSongs.filter(id => id !== youtubeId);
    } else {
      user.likedSongs.push(youtubeId);
    }
    
    await user.save();
    res.status(200).json({ 
      success: true, 
      isLiked: !isLiked,
      likedSongs: user.likedSongs 
    });

  } catch (error) {
    console.error('Lỗi thả tim:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};
const getLikedSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    const likedSongsData = await Song.find({ youtubeId: { $in: user.likedSongs } });
    res.status(200).json({ 
      success: true, 
      likedSongs: user.likedSongs,
      songsData: likedSongsData 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

module.exports = { toggleLikeSong, getLikedSongs };