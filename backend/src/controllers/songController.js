const axios = require('axios');
const Song = require('../models/Song');

const searchSongs = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Từ khóa tìm kiếm không được để trống.' });
    }

    const keyword = q.trim().toLowerCase();
    const cachedSongs = await Song.find({ searchKeyword: keyword });
    if (cachedSongs.length > 0) {
      console.log('=== LẤY DỮ LIỆU TỪ MONGO DB CACHE ===');
      return res.status(200).json({ source: 'cache', data: cachedSongs });
    }
    const enrichedQuery = `${keyword} "official audio" OR "official mv" OR "lyric video"`;

    console.log('=== GỌI API YOUTUBE (TỐN 100 QUOTA UNITS) ===');
    const youtubeUrl = 'https://www.googleapis.com/youtube/v3/search';
    
    const response = await axios.get(youtubeUrl, {
      params: {
        part: 'snippet',
        q: enrichedQuery,
        type: 'video',
        videoCategoryId: '10',
        maxResults: 10,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    const songsData = response.data.items.map(item => ({
      youtubeId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      searchKeyword: keyword
    }));
    if (songsData.length > 0) {
      await Song.insertMany(songsData, { ordered: false }).catch(() => {
      });
    }

    return res.status(200).json({ source: 'youtube_api', data: songsData });

  } catch (error) {
    console.error('Lỗi tại hệ thống tìm kiếm:', error.message);
    return res.status(500).json({ message: 'Có lỗi xảy ra tại máy chủ hệ thống.' });
  }
};

module.exports = { searchSongs };