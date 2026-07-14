const axios = require('axios');
const Song = require('../models/Song');

// =======================================================
// HÀM 1: TÌM KIẾM BÀI HÁT (CODE GỐC CỦA BẠN)
// =======================================================
const searchSongs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Từ khóa trống.' });
    const rawKeyword = q.trim();
    const normalizedKeyword = rawKeyword
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .toLowerCase().replace(/\s+/g, ' '); 
    const cachedSongs = await Song.find({ searchKeyword: normalizedKeyword });
    if (cachedSongs.length > 0) {
      console.log(`[CACHE HIT] Lấy dữ liệu từ DB cho: ${normalizedKeyword}`);
      return res.status(200).json({ source: 'cache', data: cachedSongs });
    }
    console.log(`[API CALL] Hỏi thẳng YouTube cho: ${rawKeyword}`); 
    const youtubeUrl = 'https://www.googleapis.com/youtube/v3/search';
    const response = await axios.get(youtubeUrl, {
      params: {
        part: 'snippet',
        q: rawKeyword, 
        type: 'video',
        maxResults: 20, 
        key: process.env.YOUTUBE_API_KEY
      }
    });
    const isSearchingKaraoke = rawKeyword.toLowerCase().includes('karaoke');
    const junkWords = ['1 giờ', '1 hour', 'reaction', 'tập ', 'review'];
    if (!isSearchingKaraoke) junkWords.push('karaoke');
    let songsData = response.data.items
      .map(item => ({
        youtubeId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        searchKeyword: normalizedKeyword 
      }))
      .filter(song => {
        const titleLower = song.title.toLowerCase();
        return !junkWords.some(junk => titleLower.includes(junk));
      })
      .slice(0, 10);
    if (songsData.length > 0) {
      await Song.deleteMany({ searchKeyword: normalizedKeyword });
      await Song.insertMany(songsData, { ordered: false }).catch(() => {});
    }
    return res.status(200).json({ source: 'youtube_api', data: songsData });
  } catch (error) {
    console.error('Lỗi tìm kiếm nâng cao:', error.message);
    return res.status(500).json({ message: 'Lỗi máy chủ hệ thống.' });
  }
};
// =======================================================
// HÀM TIỆN ÍCH AI: PHÂN TÍCH CẢM XÚC/THỂ LOẠI (VIBE EXTRACTION)
// =======================================================
const isVietnamese = (text) => {
  if (!text) return false;
  const vnRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vnRegex.test(text);
};

// 2. Trích xuất Thể loại, Cảm xúc & Thời đại
const extractVibes = (title, channel) => {
  if (!title) return { genres: [], era: 'modern' };
  const t = title.toLowerCase();
  const c = (channel || '').toLowerCase();
  const fullText = t + ' ' + c;
  
  const genres = [];
  let era = 'modern'; 

  if (fullText.match(/remix|mix|dj|edm|vinahouse|nonstop/)) genres.push('dance');
  if (fullText.match(/lofi|chill|relax|ngủ|nhẹ nhàng/)) genres.push('chill');
  if (fullText.match(/cover|acoustic|guitar|piano/)) genres.push('acoustic');
  if (fullText.match(/live|show|thể hiện|sân khấu/)) genres.push('live');
  if (fullText.match(/rap|hiphop|diss/)) genres.push('rap');
  if (fullText.match(/bolero|trữ tình|sến|quê hương/)) genres.push('bolero');
  if (fullText.match(/tiktok|trend|hot/)) genres.push('tiktok');
  if (fullText.match(/indie|underground/)) genres.push('indie');

  if (fullText.match(/8x|9x|làn sóng xanh|kỉ niệm|xưa|hoài niệm|bất hủ/)) {
    era = 'classic';
  }

  return { genres, era };
};

// =======================================================
// HÀM 2: SIÊU THUẬT TOÁN GỢI Ý BÀI HÁT (DEEP RANKING ENGINE)
// =======================================================
const getSmartRecommendation = async (req, res) => {
  try {
    const { currentSongId, history } = req.query;
    const listenedHistoryIds = history ? history.split(',') : [];

    let anchorSong = await Song.findOne({ youtubeId: currentSongId });

    // 1. TỰ ĐỘNG NẠP ĐẠN: Nếu bài gốc chưa có, kéo từ YouTube API về lưu luôn
    if (!anchorSong) {
      console.log(`[AI INFO] Bài gốc chưa có trong DB. Đang kéo thông tin từ YouTube API...`);
      try {
        const ytRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet',
            id: currentSongId,
            key: process.env.YOUTUBE_API_KEY
          }
        });
        
        if (ytRes.data.items && ytRes.data.items.length > 0) {
          const item = ytRes.data.items[0];
          anchorSong = await Song.create({
            youtubeId: item.id,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            searchKeyword: item.snippet.channelTitle ? item.snippet.channelTitle.toLowerCase() : 'auto-fetched'
          });
          console.log(`[AI INFO] Đã học thêm bài mới vào kho: ${anchorSong.title}`);
        }
      } catch (err) {
        console.error(`[AI ERROR] Lỗi khi kéo bài hát từ YouTube:`, err.message);
      }
    }

    // 2. LƯỚI AN TOÀN: Nếu YouTube lỗi mạng, bốc 1 bài ngẫu nhiên
    if (!anchorSong) {
      console.log(`[AI WARNING] Chịu thua, không lấy được dữ liệu. Kích hoạt bài hát ngẫu nhiên...`);
      const randomFallback = await Song.aggregate([{ $sample: { size: 1 } }]);
      return res.status(200).json({ success: true, data: randomFallback.length > 0 ? randomFallback[0] : null });
    }

    // 3. KHỞI TẠO BIẾN PHÂN TÍCH (Chính là chỗ bạn bị lỗi lúc nãy)
    const anchorInfo = extractVibes(anchorSong.title, anchorSong.channelTitle);
    const anchorIsVn = isVietnamese(anchorSong.title + ' ' + anchorSong.channelTitle);
    const anchorChannelLower = anchorSong.channelTitle ? anchorSong.channelTitle.toLowerCase() : '';

    const candidates = await Song.aggregate([
      { $match: { youtubeId: { $ne: anchorSong.youtubeId } } },
      { $sample: { size: 500 } }
    ]);

    // 4. CHẤM ĐIỂM CÁC BÀI HÁT
    const rankedCandidates = candidates.map(song => {
      let score = 0;
      const songTitleLower = song.title.toLowerCase();
      const songChannelLower = song.channelTitle ? song.channelTitle.toLowerCase() : '';
      
      const songInfo = extractVibes(song.title, song.channelTitle);
      const songIsVn = isVietnamese(song.title + ' ' + song.channelTitle);

      // Ưu tiên cùng quốc gia (Việt nghe Việt, Ngoại nghe Ngoại)
      if (anchorIsVn === songIsVn) {
        score += 150; 
      } else {
        score -= 200; 
      }

      // Ưu tiên cùng thời đại (Cũ vs Mới)
      if (anchorInfo.era === songInfo.era) {
        score += 80;
      }

      // Ưu tiên cùng thể loại (Chill, Remix,...)
      const sharedVibes = anchorInfo.genres.filter(v => songInfo.genres.includes(v));
      if (sharedVibes.length > 0) {
        score += (sharedVibes.length * 50); 
      }

      // Ca sĩ và các ca sĩ liên quan (Feat)
      if (songChannelLower === anchorChannelLower) {
        score += 30; 
      } else if (songTitleLower.includes(anchorChannelLower) || anchorSong.title.toLowerCase().includes(songChannelLower)) {
        score += 60; 
      }

      // Phạt các bài vừa mới nghe xong
      const historyIndex = listenedHistoryIds.indexOf(song.youtubeId);
      if (historyIndex !== -1) {
        score -= (1000 - historyIndex * 50); 
      }

      if (song.views) score += Math.log10(song.views) * 2; 
      score += Math.random() * 20;

      return { ...song, finalScore: score };
    });

    // 5. XUẤT KẾT QUẢ
    rankedCandidates.sort((a, b) => b.finalScore - a.finalScore);
    const bestCandidates = rankedCandidates.filter(c => c.finalScore > 0);
    
    // Nếu thuật toán vô tình trừ điểm gắt quá khiến không còn bài nào điểm dương, ta lấy random 1 bài thay vì tắt nhạc
    const nextSong = bestCandidates[0] || (await Song.aggregate([{ $sample: { size: 1 } }]))[0];

    console.log(`[AI MATRIX] Chuyển bài -> Gốc: ${anchorSong.title} | Chọn: ${nextSong?.title} (Score: ${Math.round(nextSong?.finalScore || 0)})`);
    return res.status(200).json({ success: true, data: nextSong });

  } catch (error) {
    console.error('Lỗi tại hệ thống xử lý AI thông minh:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
};

const getTrendingSongs = async (req, res) => {
  try {
    const vnTrendingRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet',
        chart: 'mostPopular',
        videoCategoryId: '10', 
        regionCode: 'VN',     
        maxResults: 20,
        key: process.env.YOUTUBE_API_KEY
      }
    });
    const krTrendingRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet',
        chart: 'mostPopular',
        videoCategoryId: '10',
        regionCode: 'KR',     
        maxResults: 10,
        key: process.env.YOUTUBE_API_KEY
      }
    });
    const formatData = (items) => items.map(item => ({
      youtubeId: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      channelTitle: item.snippet.channelTitle
    }));
    const vnSongs = formatData(vnTrendingRes.data.items);
    const krSongs = formatData(krTrendingRes.data.items);
    res.status(200).json({
      success: true,
      data: {
        trending: vnSongs.slice(0, 10), 
        vpop: vnSongs.slice(10, 20),    
        kpop: krSongs                   
      }
    });
  } catch (error) {
    console.error('Lỗi kéo Top Trending YouTube:', error.message);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

module.exports = { 
    searchSongs, 
    getSmartRecommendation, 
    getTrendingSongs
};