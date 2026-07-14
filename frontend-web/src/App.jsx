import React, { useState, useRef, useEffect, useCallback } from 'react';
import apiClient from './services/api';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, PlayCircle, PauseCircle, SkipBack, SkipForward, Menu, AudioLines, Crown, Sparkles, Tv, X, GripHorizontal, ChevronDown, Heart, Shuffle, Repeat, Repeat1, UserCircle, Play, Plus, PlusCircle, Music, Trash2 } from 'lucide-react';
import usePlayerStore from './store/usePlayerStore';
import AuthModal from './components/AuthModal';

// =====================================================================
// 1. COMPONENT TRANG CHỦ
// =====================================================================
const HomeView = () => {
  const [categories, setCategories] = useState({ trending: [], vpop: [], kpop: [] });
  const [loading, setLoading] = useState(true);
  const { setCurrentSong } = usePlayerStore();

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      // Đổi tên biến cache sang v2 để ép trình duyệt xóa sạch bộ nhớ cũ dính lỗi
      const cachedDataString = localStorage.getItem('dlua_home_data_v2'); 
      
      // KIỂM TRA BỘ NHỚ TẠM (CACHE 24H)
      if (cachedDataString) {
        try {
          const cachedData = JSON.parse(cachedDataString);
          const now = new Date().getTime();
          const oneDayInMs = 24 * 60 * 60 * 1000; 
          
          if (now - cachedData.timestamp < oneDayInMs) {
            setCategories(cachedData.data);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      // GỌI API LẤY BẢNG XẾP HẠNG TỪ BACKEND
      try {
        const response = await apiClient.get('/songs/trending');
        
        if (response.data && response.data.success) {
          const newData = response.data.data; // Đã chứa sẵn { trending, vpop, kpop } từ Backend
          setCategories(newData);
          
          // Lưu lại bộ nhớ mới cho ngày hôm nay
          localStorage.setItem('dlua_home_data_v2', JSON.stringify({
            data: newData,
            timestamp: new Date().getTime()
          }));
        }
      } catch (error) {
        console.error("Lỗi tải bảng xếp hạng:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
      <div className="relative flex justify-center items-center">
        <div className="absolute w-16 h-16 border-t-2 border-emerald-400 rounded-full animate-spin"></div>
        <AudioLines className="text-emerald-500 animate-pulse" size={28} />
      </div>
      <p className="text-emerald-400/80 font-medium tracking-[0.2em] uppercase text-xs">Đang đồng bộ dữ liệu...</p>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: KHÁM PHÁ */}
        <div className="xl:col-span-2 space-y-12">
          {/* Section: V-Pop */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-emerald-400" size={24} />
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">Tuyệt Đỉnh V-Pop</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
              {categories.vpop.slice(0, 8).map((song, i) => (
                <div key={i} onClick={() => setCurrentSong(song)} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl aspect-square mb-3 md:mb-4 shadow-lg bg-white/5 border border-white/5">
                    <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <PlayCircle size={40} strokeWidth={1.5} className="text-emerald-400 drop-shadow-xl scale-75 group-hover:scale-100 transition-transform duration-300 md:w-[50px] md:h-[50px]" />
                    </div>
                  </div>
                  <h4 className="text-[13px] md:text-sm font-bold text-gray-100 line-clamp-1 group-hover:text-emerald-400 transition-colors">{song.title}</h4>
                  <p className="text-[11px] md:text-xs text-gray-500 mt-1 line-clamp-1">{song.channelTitle}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: K-Pop */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-cyan-400" size={24} />
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">Xu Hướng K-Pop</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
              {categories.kpop.slice(0, 8).map((song, i) => (
                <div key={i} onClick={() => setCurrentSong(song)} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl aspect-square mb-3 md:mb-4 shadow-lg bg-white/5 border border-white/5">
                    <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <PlayCircle size={40} strokeWidth={1.5} className="text-emerald-400 drop-shadow-xl scale-75 group-hover:scale-100 transition-transform duration-300 md:w-[50px] md:h-[50px]" />
                    </div>
                  </div>
                  <h4 className="text-[13px] md:text-sm font-bold text-gray-100 line-clamp-1 group-hover:text-cyan-400 transition-colors">{song.title}</h4>
                  <p className="text-[11px] md:text-xs text-gray-500 mt-1 line-clamp-1">{song.channelTitle}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CỘT PHẢI: BẢNG XẾP HẠNG */}
        <aside className="xl:col-span-1">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 md:p-6 shadow-2xl sticky top-6">
            <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-white/10 pb-4">
              <Crown className="text-yellow-400" size={24} />
              <h2 className="text-lg md:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">Top 10 MV Trending</h2>
            </div>
            
            <div className="flex flex-col gap-3 md:gap-4">
              {categories.trending.map((song, i) => {
                let rankColor = "text-gray-500";
                if (i === 0) rankColor = "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]";
                if (i === 1) rankColor = "text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]";
                if (i === 2) rankColor = "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]";

                return (
                  <div key={i} onClick={() => setCurrentSong(song)} className="flex items-center gap-3 md:gap-4 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                    <div className={`w-5 md:w-6 text-lg md:text-xl font-black italic text-center ${rankColor}`}>{i + 1}</div>
                    <img src={song.thumbnail} className="w-10 h-10 md:w-12 md:h-12 rounded-md object-cover shadow-md group-hover:scale-105 transition-transform" alt="cover" />
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-[13px] md:text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-white">{song.title}</h4>
                      <p className="text-[11px] md:text-xs text-gray-500 line-clamp-1 mt-0.5">{song.channelTitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// =====================================================================
// 2. COMPONENT TÌM KIẾM
// =====================================================================
const SearchView = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentSong } = usePlayerStore();

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && keyword.trim() !== '') {
      setLoading(true);
      try {
        // TẦNG 1: "BƠM" TỪ KHÓA ĐỂ ÉP YOUTUBE
        // Âm thầm cộng thêm các từ khóa chuyên nhạc để YouTube tự hiểu ta đang tìm nhạc
        const magicQuery = encodeURIComponent(keyword + ' official MV audio bài hát');
        const response = await apiClient.get(`/songs/search?q=${magicQuery}`);
        let fetchedSongs = response.data.data || [];

        // TẦNG 2: THUẬT TOÁN CHẤM ĐIỂM (SCORING) THAY VÌ LỌC BỎ
        const premiumWords = ['official', 'mv', 'lyric', 'audio', 'cover', 'remix', 'studio', 'live', 'version', 'bài hát'];
        const trashWords = ['reaction', 'review', 'phỏng vấn', 'tin tức', 'news', 'shorts', 'vlog', 'tập', 'bắt tạm giam', 'scandal', 'nsnd', 'drama'];

        // Cấp điểm cho từng video
        const scoredSongs = fetchedSongs.map(song => {
          let score = 0;
          const title = song.title.toLowerCase();
          const channel = song.channelTitle?.toLowerCase() || '';

          // 1. Cộng điểm nếu là âm nhạc
          if (premiumWords.some(w => title.includes(w))) score += 50;
          if (channel.includes('official') || channel.includes('singer') || channel.includes('music')) score += 50;
          if (channel.includes(keyword.toLowerCase())) score += 30; // Trùng tên ca sĩ

          // 2. Trừ điểm cực nặng nếu có mùi tin tức/rác
          if (trashWords.some(w => title.includes(w) || channel.includes(w))) score -= 200;

          return { ...song, score };
        });

        // TẦNG 3: SẮP XẾP VÀ HIỂN THỊ
        // Xếp video điểm cao (nhạc xịn) lên đầu, video điểm âm (tin tức) cút xuống đáy
        scoredSongs.sort((a, b) => b.score - a.score);

        // Chỉ cắt bỏ những video âm điểm NẾU danh sách còn đủ dài (giữ lại ít nhất 5 kết quả)
        let finalSongs = scoredSongs.filter(s => s.score > -50);
        if (finalSongs.length < 5) finalSongs = scoredSongs; 

        // Xóa thuộc tính score dư thừa trước khi đưa lên UI
        finalSongs = finalSongs.map(({ score, ...rest }) => rest);

        setResults(finalSongs);
      } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 md:mb-8 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Tìm kiếm âm nhạc</h2>
      <div className="relative">
        <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Nhập tên bài hát..." 
          className="w-full bg-white/5 border border-white/10 rounded-full py-3 md:py-4 pl-12 md:pl-14 pr-6 text-white text-base md:text-lg placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all shadow-2xl backdrop-blur-md"
        />
      </div>

      <div className="mt-8 md:mt-10 grid grid-cols-1 gap-2 md:gap-3">
        {loading && <p className="text-emerald-400 font-medium animate-pulse text-center">Đang phân tích dữ liệu...</p>}
        {!loading && results.map((song, index) => (
          <div key={index} onClick={() => setCurrentSong(song)} className="flex items-center gap-4 md:gap-5 p-2 md:p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5 group">
            <div className="relative w-14 h-10 md:w-16 md:h-12 overflow-hidden rounded-md shadow-md">
               <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <PlayCircle size={20} className="text-white" />
               </div>
            </div>
            <div className="flex-1">
              <h4 className="text-[13px] md:text-base font-bold text-gray-200 line-clamp-1 group-hover:text-emerald-400 transition-colors">{song.title}</h4>
              <p className="text-[11px] md:text-sm text-gray-500 line-clamp-1 mt-0.5">{song.channelTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =====================================================================
// COMPONENT: PLAYLIST COVER TỰ ĐỘNG CHIA 4 Ô
// =====================================================================
const PlaylistCover = ({ songs, iconSize = 48, smallIconSize = 20 }) => {
  // Nếu chưa có bài nào, hiển thị 1 ô xám to đùng
  if (!songs || songs.length === 0) {
    return (
      <div className="w-full h-full bg-[#282828] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
        <Music size={iconSize} className="text-[#b3b3b3]" />
      </div>
    );
  }

  // Thuật toán lấy 4 ô: Có ảnh thì hiện ảnh, không có thì hiện ô xám nốt nhạc
  const covers = [0, 1, 2, 3].map(i => songs[i]?.thumbnail || null);

  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full h-full shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden bg-[#282828]">
      {covers.map((src, i) => src ? (
        <img key={i} src={src} className="w-full h-full object-cover" alt="cover" />
      ) : (
        <div key={i} className="w-full h-full bg-[#3e3e3e] flex items-center justify-center border-[0.5px] border-[#181818]">
          <Music size={smallIconSize} className="text-[#b3b3b3]" />
        </div>
      ))}
    </div>
  );
};

// =====================================================================
// COMPONENT THƯ VIỆN (LIBRARY)
// =====================================================================
const LibraryView = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('home'); 
  const [activePlaylist, setActivePlaylist] = useState(null); // Lưu trữ playlist đang được chọn xem chi tiết

  const { setCurrentSong, setQueue, setCreatePlaylistOpen, myPlaylists, fetchMyPlaylists, showToast } = usePlayerStore();
  const currentUser = JSON.parse(localStorage.getItem('dlua_user'));

  useEffect(() => {
    const fetchLibrary = async () => {
      const token = localStorage.getItem('dlua_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiClient.get('/user/liked');
        setLikedSongs(res.data.songsData || []);
        await fetchMyPlaylists(); 
      } catch (error) {
        console.error("Lỗi tải thư viện:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const handlePlayPlaylist = (songs) => {
    if (songs && songs.length > 0) {
      setQueue(songs, 0); 
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh sách phát này?")) {
      try {
        await apiClient.delete(`/playlists/${id}`);
        showToast("Đã xóa danh sách phát!");
        await fetchMyPlaylists();
        setActiveView('home');
      } catch (error) {
        showToast("Lỗi xóa danh sách phát!");
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-fade-in">
        <Heart size={64} className="text-gray-800 mb-6" />
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Bạn chưa đăng nhập</h2>
        <p className="text-gray-400">Đăng nhập ngay để xem các Playlist của bạn nhé!</p>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN 2 & 3: CHI TIẾT PLAYLIST ĐÃ THÍCH HOẶC TỰ TẠO
  // ==========================================
  if (activeView === 'liked_playlist' || activeView === 'custom_playlist') {
    const isLiked = activeView === 'liked_playlist';
    const displaySongs = isLiked ? likedSongs : activePlaylist?.songs || [];
    const displayTitle = isLiked ? "Bài hát đã thích" : activePlaylist?.title;
    
    // THUẬT TOÁN SINH MÀU TỪ BÀI HÁT ĐẦU TIÊN
    const getDynamicGradient = (song) => {
      if (!song || !song.youtubeId) return 'from-[#3e3e3e]'; 
      const colors = ['from-red-600', 'from-blue-600', 'from-emerald-600', 'from-purple-600', 'from-pink-600', 'from-yellow-600', 'from-indigo-600', 'from-teal-600', 'from-orange-600', 'from-cyan-600'];
      const charCodeSum = song.youtubeId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return colors[charCodeSum % colors.length];
    };
    const dynamicGradient = isLiked ? 'from-[#4a307a]' : getDynamicGradient(displaySongs[0]);

    return (
      // THẺ DIV BAO BỌC NGOÀI CÙNG (Đã được khôi phục)
      <div className="animate-fade-in -mx-4 -mt-4 md:-mx-10 md:-mt-10 bg-[#121212] min-h-screen flex flex-col">
        
        {/* BAO TOÀN BỘ PHẦN TRÊN BẰNG 1 KHỐI GRADIENT ĐỒNG NHẤT */}
        <div className={`bg-gradient-to-b ${dynamicGradient} to-[#121212] px-4 md:px-10 pt-4 md:pt-8 pb-6 transition-colors duration-700`}>
          
          {/* Nút quay lại */}
          <div className="flex items-center mb-4 md:mb-6">
            <button onClick={() => setActiveView('home')} className="w-9 h-9 md:w-10 md:h-10 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors backdrop-blur-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          </div>

          {/* HEADER PLAYLIST INFO */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 text-center md:text-left">
            <div className="w-32 h-32 md:w-56 md:h-56 shrink-0 shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
              {isLiked ? (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <Heart size={60} className="text-white fill-white drop-shadow-lg md:w-[80px] md:h-[80px]" />
                </div>
              ) : (
                <PlaylistCover songs={displaySongs} iconSize={64} smallIconSize={28} />
              )}
            </div>
            <div className="flex flex-col text-white mt-2 md:mt-0">
              <span className="text-sm font-bold mb-1 md:mb-2 hidden md:block">{isLiked ? 'Danh sách phát công khai' : 'Danh sách phát của bạn'}</span>
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-2 md:mb-6 line-clamp-2">{displayTitle}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-[12px] md:text-sm font-medium">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-xs">{currentUser.name.charAt(0).toUpperCase()}</span>
                <span className="font-bold hover:underline cursor-pointer">{currentUser.name}</span>
                <span className="text-gray-300">• {displaySongs.length} bài hát</span>
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN DANH SÁCH BÀI HÁT */}
        <div className="px-4 md:px-10 pb-32 flex-1">
          <div className="py-6 flex items-center gap-6">
            <div 
              onClick={() => handlePlayPlaylist(displaySongs)}
              className="w-14 h-14 md:w-16 md:h-16 bg-[#1ed760] rounded-full flex items-center justify-center cursor-pointer hover:scale-105 hover:bg-emerald-400 shadow-[0_8px_8px_rgba(0,0,0,0.3)] transition-all"
            >
              <svg viewBox="0 0 24 24" fill="black" className="w-7 h-7 md:w-8 md:h-8 ml-1">
                <path d="M6 4l15 8-15 8z" />
              </svg>
            </div>
            <Shuffle onClick={usePlayerStore.getState().toggleShuffle} size={32} className={`cursor-pointer transition-colors ${usePlayerStore.getState().isShuffle ? 'text-[#1ed760]' : 'text-gray-400 hover:text-white'}`} />
            
            {!isLiked && (
              <div className="flex-1 flex justify-end">
                <Trash2 onClick={() => handleDeletePlaylist(activePlaylist._id)} size={24} className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-[16px_1fr_40px] md:grid-cols-[40px_1fr_1fr_60px] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-white/10 mb-4 items-center">
            <div className="text-center">#</div>
            <div>Tiêu đề</div>
            <div className="hidden md:block">Album</div>
            <div className="flex justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          </div>

          <div className="flex flex-col">
            {displaySongs.map((song, index) => (
              <div 
                key={index} 
                onClick={() => setQueue(displaySongs, index)}
                className="grid grid-cols-[16px_1fr_40px] md:grid-cols-[40px_1fr_1fr_60px] gap-4 px-4 py-2.5 rounded-md hover:bg-white/10 group cursor-pointer transition-colors items-center"
              >
                <div className="text-gray-400 text-center text-sm group-hover:hidden">{index + 1}</div>
                <div className="hidden group-hover:flex items-center justify-center text-white"><Play size={16} fill="currentColor" /></div>
                
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={song.thumbnail} alt={song.title} className="w-10 h-10 object-cover rounded shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-white font-medium line-clamp-1 group-hover:text-emerald-400">{song.title}</span>
                    <span className="text-gray-400 text-sm line-clamp-1 md:hidden">{song.channelTitle}</span>
                  </div>
                </div>

                <div className="text-gray-400 text-sm hidden md:block truncate hover:underline hover:text-white">
                  {song.channelTitle}
                </div>
                
                <div className="flex items-center justify-end gap-4">
                  {isLiked && <Heart size={18} className="text-emerald-500 fill-emerald-500 hidden md:block" />}
                  <span className="text-gray-400 text-sm">--:--</span>
                </div>
              </div>
            ))}
            {displaySongs.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                Chưa có bài hát nào. Hãy tìm nhạc và thêm vào danh sách phát nhé!
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN 1: TRANG CHỦ THƯ VIỆN (LƯỚI PLAYLIST)
  // ==========================================
  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6">Thư viện của bạn</h2>
      
      {loading ? (
        <p className="text-emerald-400 animate-pulse font-medium">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          
          {/* PLAYLIST BÀI HÁT ĐÃ THÍCH */}
          <div 
            onClick={() => setActiveView('liked_playlist')}
            className="bg-[#181818] hover:bg-[#282828] p-3 md:p-4 rounded-lg cursor-pointer transition-all group flex flex-col"
          >
            <div className="relative w-full aspect-square bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-md shadow-lg mb-4 flex items-center justify-center overflow-hidden">
              <Heart size={64} className="text-white fill-white drop-shadow-md" />
              <div className="absolute bottom-2 right-2 w-10 h-10 md:w-12 md:h-12 bg-[#1ed760] rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl">
                <Play size={20} fill="black" className="text-black ml-1 md:w-6 md:h-6" />
              </div>
            </div>
            <h4 className="text-white font-bold truncate mb-1 text-sm md:text-base">Bài hát đã thích</h4>
            <p className="text-gray-400 text-xs md:text-sm">{likedSongs.length} bài hát</p>
          </div>

          {/* CÁC PLAYLIST CÁ NHÂN TỰ TẠO */}
          {myPlaylists.map(playlist => (
            <div 
              key={playlist._id}
              onClick={() => { setActivePlaylist(playlist); setActiveView('custom_playlist'); }}
              className="bg-[#181818] hover:bg-[#282828] p-3 md:p-4 rounded-lg cursor-pointer transition-all group flex flex-col"
            >
              <div className="relative w-full aspect-square rounded-md shadow-lg mb-4 flex items-center justify-center overflow-hidden bg-[#282828]">
                <PlaylistCover songs={playlist.songs} />
                <div className="absolute bottom-2 right-2 w-10 h-10 md:w-12 md:h-12 bg-[#1ed760] rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl">
                  <Play size={20} fill="black" className="text-black ml-1 md:w-6 md:h-6" />
                </div>
              </div>
              <h4 className="text-white font-bold truncate mb-1 text-sm md:text-base">{playlist.title}</h4>
              <p className="text-gray-400 text-xs md:text-sm">Bạn • {playlist.songs.length} bài hát</p>
            </div>
          ))}

          {/* NÚT TẠO PLAYLIST MỚI (CHỐT CUỐI) */}
          <div 
            onClick={() => setCreatePlaylistOpen(true)}
            className="bg-[#181818] hover:bg-[#282828] p-3 md:p-4 rounded-lg cursor-pointer transition-all group flex flex-col items-center justify-center border-2 border-dashed border-gray-600 hover:border-gray-400 opacity-70 hover:opacity-100 aspect-[3/4]"
          >
            <PlusCircle size={40} className="text-gray-400 mb-2 group-hover:text-white transition-colors" strokeWidth={1.5} />
            <h4 className="text-white font-bold text-sm">Tạo danh sách</h4>
          </div>

        </div>
      )}
    </div>
  );
};

// =====================================================================
// 3. COMPONENT PLAYER BAR
// =====================================================================
const PlayerBar = () => {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, playSmartNext, setIsPlaying, isShuffle, toggleShuffle, repeatMode, toggleRepeat, likedSongsList, setLikedSongsList } = usePlayerStore();
  const playerRef = useRef(null); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);

  const [showMiniPlayer, setShowMiniPlayer] = useState(true);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false); 
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const token = localStorage.getItem('dlua_token');
    if (token) {
      apiClient.get('/user/liked')
        .then(res => setLikedSongsList(res.data.likedSongs))
        .catch(err => console.log('Chưa đăng nhập hoặc lỗi:', err));
    }
  }, [setLikedSongsList]);

  const handleLikeClick = async (e) => {
    e.stopPropagation(); 
    const token = localStorage.getItem('dlua_token');
    
    if (!token) {
      usePlayerStore.getState().showToast('Vui lòng đăng nhập để lưu nhạc yêu thích!');
      usePlayerStore.getState().setAuthOpen(true);
      return;
    }
    
    try {
    // GỬI ĐẦY ĐỦ THÔNG TIN BÀI HÁT ĐỂ BACKEND LƯU VÀO DATABASE
    const res = await apiClient.post('/user/like', { 
      youtubeId: currentSong.youtubeId,
      title: currentSong.title,
      thumbnail: currentSong.thumbnail,
      channelTitle: currentSong.channelTitle,
      duration: currentSong.duration || "0:00" 
    }); 
    
    setLikedSongsList(res.data.likedSongs);
  } catch (error) {
    console.error('Lỗi thả tim:', error);
  }
  };

  const isLiked = currentSong ? likedSongsList.includes(currentSong.youtubeId) : false;

  const handleMouseDown = (e) => {
    if (window.innerWidth < 768) return; 
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    if (playerRef.current && playerRef.current.contentWindow) {
      const command = isPlaying ? 'playVideo' : 'pauseVideo';
      playerRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: command, args: [] }), '*');
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (event.origin !== 'https://www.youtube.com') return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'infoDelivery' && data.info) {
          const state = data.info.playerState;
          if (state === 0) {
            if (usePlayerStore.getState().repeatMode === 'one') {
              playerRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }), '*');
              playerRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
            } else {
              playSmartNext();
            }
          }
          else if (state === 1 && !isPlaying) setIsPlaying(true);
          else if (state === 2 && isPlaying) setIsPlaying(false);

          if (data.info.currentTime !== undefined) setCurrentTime(data.info.currentTime);
          if (data.info.duration !== undefined) setDuration(data.info.duration);
        }
      } catch (error) {}
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [isPlaying, playSmartNext, setIsPlaying]);

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerRef.current && playerRef.current.contentWindow) {
      playerRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }), '*');
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current && playerRef.current.contentWindow) {
      playerRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [newVolume] }), '*');
    }
  };

  return (
    <>
      <footer className="h-[72px] md:h-24 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/5 flex items-center justify-between px-3 md:px-6 fixed bottom-16 md:bottom-0 w-full z-50 gap-2">
        
        {/* CỘT TRÁI: THÔNG TIN (Ép min-w-0 để lấy diện tích cho tên bài hát trên mobile) */}
        <div 
          className="flex-1 min-w-0 flex items-center gap-3 cursor-pointer md:cursor-default"
          onClick={() => { if(window.innerWidth < 768 && currentSong) setIsMobileExpanded(true); }}
        >
          {currentSong ? (
            <>
              <img src={currentSong.thumbnail} alt="Cover" className="w-10 h-10 md:w-14 md:h-14 rounded-lg shadow-md object-cover border border-white/10 shrink-0" />
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-[13px] md:text-sm font-bold text-gray-100 tracking-wide truncate">{currentSong.title}</h4>
                <p className="text-[11px] md:text-xs text-gray-400 mt-0.5 truncate">{currentSong.channelTitle}</p>
              </div>
              
              {/* Nút THÊM PLAYLIST (Bên trái) */}
              <PlusCircle 
                onClick={(e) => { e.stopPropagation(); usePlayerStore.getState().openAddToPlaylist(currentSong); }} 
                size={20} 
                className="hidden md:block ml-1 cursor-pointer transition-colors text-gray-400 hover:text-white shrink-0 active:scale-95" 
              />
              
              {/* Nút TIM (Bên phải) */}
              <Heart 
                onClick={handleLikeClick} 
                size={20} 
                className={`hidden md:block ml-3 cursor-pointer transition-all active:scale-75 shrink-0 ${isLiked ? 'text-emerald-500 fill-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-gray-400 hover:text-white'}`} 
              />
            </>
          ) : (
            <div className="text-gray-500 text-xs md:text-sm font-medium truncate">Hệ thống sẵn sàng...</div>
          )}
        </div>

        {/* CỘT GIỮA: ĐIỀU KHIỂN (Đẩy nút sang góc phải trên Mobile) */}
        <div className="flex-none flex flex-col items-center justify-center gap-1 md:gap-2">
          <div className="flex items-center gap-4 md:gap-6">
            <Shuffle onClick={toggleShuffle} size={20} className={`hidden md:block cursor-pointer transition-colors ${isShuffle ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`} />
            <SkipBack onClick={playPrev} className="text-gray-400 hover:text-white hidden md:block cursor-pointer active:scale-95" size={24} />
            
            {/* NÚT PLAY VIỀN XANH CHÂN ÁI */}
            <div onClick={togglePlay} className="cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0">
              {isPlaying ? (
                <PauseCircle className="w-10 h-10 md:w-[46px] md:h-[46px] text-emerald-400 hover:text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)] transition-colors" strokeWidth={1.2} />
              ) : (
                <PlayCircle className="w-10 h-10 md:w-[46px] md:h-[46px] text-emerald-400 hover:text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)] transition-colors" strokeWidth={1.2} />
              )}
            </div>

            <SkipForward onClick={playSmartNext} className="text-gray-400 hover:text-white hidden md:block cursor-pointer active:scale-95" size={24} />
            <div onClick={toggleRepeat} className="hidden md:block cursor-pointer">
              {repeatMode === 'one' ? (
                <Repeat1 size={20} className="text-emerald-400" />
              ) : (
                <Repeat size={20} className={`transition-colors ${repeatMode === 'all' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`} />
              )}
            </div>
          </div>
          
          <div className="w-full flex items-center justify-center gap-3 text-[11px] text-gray-400 hidden md:flex min-w-[300px]">
            <span>{formatTime(currentTime)}</span>
            <input 
              type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeekChange}
              className="w-full h-1 bg-gray-700/50 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* CỘT PHẢI: ÂM LƯỢNG (Chỉ hiện PC) */}
        <div className="hidden md:flex flex-1 justify-end items-center gap-3 pr-2 md:pr-4">
          <button 
            onClick={() => setShowMiniPlayer(!showMiniPlayer)} 
            className={`p-2 rounded-full hidden md:block ${showMiniPlayer ? 'text-emerald-400' : 'text-gray-500'}`}
          >
            <Tv size={20} />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <AudioLines size={18} className="text-gray-400" />
            <input 
              type="range" min={0} max={100} value={volume} onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-700/50 rounded-full appearance-none accent-emerald-500"
            />
          </div>
        </div>
      </footer>

      {/* GIAO DIỆN MOBILE PHÓNG TO LÊN */}
      {isMobileExpanded && currentSong && (
        <div className="fixed inset-0 z-[100] bg-gradient-to-b from-gray-800 to-[#121212] flex flex-col px-6 pt-10 pb-8 animate-slide-up">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl z-0 pointer-events-none"
            style={{ backgroundImage: `url(${currentSong.thumbnail})` }}
          ></div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <ChevronDown onClick={() => setIsMobileExpanded(false)} size={32} className="text-white cursor-pointer" />
              <span className="text-xs font-bold tracking-widest text-white/80 uppercase">Đang phát</span>
              <Menu size={24} className="text-white" />
            </div>

            <div className="w-full aspect-square rounded-xl shadow-2xl overflow-hidden mb-8 mt-4">
              <img src={currentSong.thumbnail} className="w-full h-full object-cover" alt="Cover" />
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="overflow-hidden pr-4">
                <h2 className="text-2xl font-bold text-white truncate">{currentSong.title}</h2>
                <p className="text-lg text-gray-400 truncate mt-1">{currentSong.channelTitle}</p>
              </div>
              <Heart 
                onClick={handleLikeClick} 
                size={28} 
                className={`shrink-0 cursor-pointer transition-all active:scale-75 ${isLiked ? 'text-emerald-500 fill-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-gray-400 hover:text-white'}`} 
              />
            </div>

            <div className="mb-6">
              <input 
                type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeekChange}
                className="w-full h-1 bg-gray-600 rounded-full appearance-none accent-white mb-2"
              />
              <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Shuffle onClick={toggleShuffle} size={24} className={`cursor-pointer transition-colors ${isShuffle ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`} />
              
              <SkipBack onClick={playPrev} size={36} className="text-white fill-white cursor-pointer active:scale-95" />
              
              {/* NÚT PLAY VIỀN XANH CHÂN ÁI (MOBILE FULLSCREEN) */}
              <div onClick={togglePlay} className="cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0">
                {isPlaying ? (
                  <PauseCircle className="w-16 h-16 text-emerald-400 hover:text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-colors" strokeWidth={1.2} />
                ) : (
                  <PlayCircle className="w-16 h-16 text-emerald-400 hover:text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-colors" strokeWidth={1.2} />
                )}
              </div>

              <SkipForward onClick={playSmartNext} size={36} className="text-white fill-white cursor-pointer active:scale-95" />
              
              <div onClick={toggleRepeat} className="cursor-pointer">
                {repeatMode === 'one' ? (
                  <Repeat1 size={24} className="text-emerald-400" />
                ) : (
                  <Repeat size={24} className={`transition-colors ${repeatMode === 'all' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`} />
                )}
              </div>
            </div>
            
            <div className="mt-auto flex flex-col gap-5">
              {/* Nút Thêm vào Playlist (Mobile) */}
              <div 
                onClick={(e) => { e.stopPropagation(); usePlayerStore.getState().openAddToPlaylist(currentSong); }}
                className="flex items-center gap-3 px-1 cursor-pointer group w-max"
              >
                <PlusCircle size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Thêm vào danh sách phát</span>
              </div>
              
              {/* Box Lời bài hát */}
              <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-white/20 transition-colors">
                <span className="text-sm font-bold text-white">Lời bài hát</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white">Đang phát triển</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ĐĨA THAN CHẠY ẨN GÓC PHẢI PC */}
      {currentSong && (
        <div 
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          className={`fixed bottom-36 md:bottom-28 right-2 md:right-8 w-[180px] md:w-[240px] h-[240px] md:h-[300px] rounded-2xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)] border border-white/10 bg-black z-40 group transition-shadow ${!showMiniPlayer ? 'hidden' : 'hidden md:block'}`}
        >
          <div onMouseDown={handleMouseDown} className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/80 to-transparent z-50 cursor-move flex justify-end items-start pt-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripHorizontal size={20} className="text-white/60 hover:text-white hidden md:block absolute left-1/2 -translate-x-1/2" />
            <X size={20} className="text-white/60 hover:text-red-400 cursor-pointer" onClick={() => setShowMiniPlayer(false)} />
          </div>

          <div className="absolute inset-0 z-40 pointer-events-none flex flex-col items-center justify-center bg-gray-900 overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-xl scale-125" style={{ backgroundImage: `url(${currentSong.thumbnail})` }}></div>

            <div className={`relative w-28 h-28 md:w-40 md:h-40 rounded-full border-4 border-gray-900 shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-500 ${isPlaying ? 'animate-[spin_12s_linear_infinite] scale-100' : 'scale-95'}`}>
              <div className="absolute inset-0 border-[12px] border-black rounded-full z-10 opacity-80 pointer-events-none"></div>
              <img src={currentSong.thumbnail} alt="Disc" className="w-full h-full object-cover" />
              <div className="absolute w-4 h-4 md:w-5 md:h-5 bg-gray-900 rounded-full border-2 border-gray-600 z-20"></div>
            </div>

            <div className={`absolute bottom-6 flex gap-1.5 items-end h-8 transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_1s_infinite] h-4"></div>
              <div className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite_0.2s] h-8"></div>
              <div className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_1.2s_infinite_0.4s] h-5"></div>
              <div className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_0.9s_infinite_0.1s] h-7"></div>
              <div className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_1.1s_infinite_0.3s] h-3"></div>
            </div>
          </div>

          <div className="absolute inset-0 z-0 opacity-0 pointer-events-none overflow-hidden">
            <iframe
              ref={playerRef}
              onLoad={() => {
                if (playerRef.current && playerRef.current.contentWindow) {
                  playerRef.current.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
                }
              }}
              width="100%" height="100%"
              src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&enablejsapi=1&controls=0&modestbranding=1&rel=0&fs=0`}
              title="YT" frameBorder="0" allow="autoplay"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};
// =====================================================================
// COMPONENT: BẢNG TẠO PLAYLIST MỚI
// =====================================================================
const CreatePlaylistModal = () => {
  const { isCreatePlaylistOpen, setCreatePlaylistOpen, fetchMyPlaylists, showToast } = usePlayerStore();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isCreatePlaylistOpen) return null;

  const handleCreate = async () => {
    if (!title.trim()) return alert("Vui lòng nhập tên Playlist!");
    setLoading(true);
    try {
      await apiClient.post('/playlists', { title });
      await fetchMyPlaylists();
      showToast('Đã tạo playlist thành công!');
      setCreatePlaylistOpen(false);
      setTitle('');
    } catch (error) {
      alert("Lỗi khi tạo playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-[#282828] w-full max-w-md rounded-xl p-6 shadow-2xl relative animate-fade-in">
        <button onClick={() => setCreatePlaylistOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
        <h2 className="text-2xl font-bold text-white mb-6">Tạo danh sách phát</h2>
        <input 
          type="text" autoFocus placeholder="Tên danh sách phát..." value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white/10 text-white px-4 py-3 rounded-md outline-none focus:bg-white/20 transition-all mb-6 font-bold text-lg"
        />
        <div className="flex justify-end gap-3">
          <button onClick={() => setCreatePlaylistOpen(false)} className="px-6 py-2.5 font-bold text-white hover:scale-105 transition-transform">Hủy</button>
          <button onClick={handleCreate} disabled={loading} className="px-6 py-2.5 bg-[#1ed760] text-black font-bold rounded-full hover:scale-105 hover:bg-emerald-400 transition-transform">{loading ? 'Đang tạo...' : 'Tạo mới'}</button>
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// COMPONENT: MENU THÊM BÀI HÁT VÀO PLAYLIST
// =====================================================================
const AddToPlaylistModal = () => {
  const { isAddToPlaylistOpen, closeAddToPlaylist, songToAdd, myPlaylists, fetchMyPlaylists, setCreatePlaylistOpen, showToast } = usePlayerStore();

  if (!isAddToPlaylistOpen || !songToAdd) return null;

  const handleToggleSong = async (playlistId) => {
    try {
      await apiClient.post('/playlists/toggle', { playlistId, song: songToAdd });
      await fetchMyPlaylists();
      showToast('Đã cập nhật vào Playlist!');
      closeAddToPlaylist();
    } catch (error) {
      showToast('Có lỗi xảy ra!');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={closeAddToPlaylist}>
      <div className="bg-[#282828] w-full max-w-sm rounded-xl py-4 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="px-4 pb-3 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Thêm vào danh sách phát</h3>
          <button onClick={closeAddToPlaylist} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
          <div onClick={() => { closeAddToPlaylist(); setCreatePlaylistOpen(true); }} className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors group">
            <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center group-hover:bg-white/20"><Plus size={24} className="text-white" /></div>
            <span className="text-white font-bold text-sm">Tạo danh sách phát mới</span>
          </div>
          
          {myPlaylists.map(pl => {
            const hasSong = pl.songs.some(s => s.youtubeId === songToAdd.youtubeId);
            return (
              <div key={pl._id} onClick={() => handleToggleSong(pl._id)} className="flex items-center justify-between px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#3e3e3e] flex items-center justify-center rounded overflow-hidden">
                    {pl.songs[0] ? <img src={pl.songs[0].thumbnail} className="w-full h-full object-cover" /> : <Music size={20} className="text-[#b3b3b3]" />}
                  </div>
                  <div className="flex flex-col"><span className="text-white font-medium text-sm line-clamp-1">{pl.title}</span><span className="text-gray-400 text-xs">{pl.songs.length} bài hát</span></div>
                </div>
                {hasSong && <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg></span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
// =====================================================================
// 4. MAIN LAYOUT
// =====================================================================
function MainLayout() {
  const location = useLocation();
  const { isAuthOpen, setAuthOpen, toastMessage } = usePlayerStore();
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('dlua_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  // =========================================================
  // THUẬT TOÁN "GIĂNG LƯỚI" BẮT TOKEN TỪ DLUACHAT TRẢ VỀ
  // =========================================================
useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    if (authCode) {
      const exchangeCodeForToken = async () => {
        try {
          const response = await apiClient.post('/auth/dlua-sso-callback', { code: authCode });
          
          if (response.data && response.data.success) {
            localStorage.setItem('dlua_token', response.data.token);
            localStorage.setItem('dlua_user', JSON.stringify(response.data.user));

            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            window.location.reload(); 
          }
        } catch (error) {
          console.error("Lỗi khi đổi Code lấy Token:", error);
          alert("Đăng nhập SSO thất bại!");
        }
      };
      
      exchangeCodeForToken();
    }
  }, []);
  useEffect(() => {
    usePlayerStore.getState().fetchLikedSongs();
    usePlayerStore.getState().fetchMyPlaylists();
  }, []);
  // Hàm Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('dlua_token');
    localStorage.removeItem('dlua_user');
    setCurrentUser(null);
    usePlayerStore.getState().setLikedSongsList([]);
    usePlayerStore.getState().showToast('Đã đăng xuất thành công!');
  };

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col font-sans overflow-hidden selection:bg-emerald-500/30">
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-black p-6 flex-col hidden md:flex border-r border-white/5">
          <div className="flex items-center gap-3 mb-12 cursor-pointer">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <AudioLines size={28} color="white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">DluaMusic</h1>
          </div>

          <nav className="space-y-2">
            <Link to="/" className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 ${location.pathname === '/' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white font-medium'}`}>
              <Home strokeWidth={2} size={22} /> <span>Trang chủ</span>
            </Link>
            <Link to="/search" className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 ${location.pathname === '/search' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white font-medium'}`}>
              <Search strokeWidth={2} size={22} /> <span>Tìm kiếm</span>
            </Link>
            <Link to="/library" className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 ${location.pathname === '/library' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white font-medium'}`}>
              <Library strokeWidth={2} size={22} /> <span>Thư viện</span>
            </Link>
            
            {/* Nút Đăng nhập/Đăng ký trên Sidebar (PC) */}
            <div className="mt-8 pt-6 border-t border-white/10">
              {currentUser ? (
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-xs text-emerald-400 font-medium">Premium Member</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full text-xs font-bold text-gray-400 hover:text-red-400 bg-black/50 py-2 rounded-lg transition-colors">
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setAuthOpen(true)}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-emerald-400 hover:text-white transition-all duration-300"
                >
                  <UserCircle size={20} />
                  Đăng nhập
                </button>
              )}
            </div>
          </nav>
        </aside>

        <main className="flex-1 bg-gradient-to-b from-[#1a1a1a] via-[#050505] to-black overflow-y-auto p-4 md:p-10 pb-36 md:pb-32">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/search" element={<SearchView />} />
            <Route path="/library" element={<LibraryView />} />
          </Routes>
        </main>
      </div>

      <PlayerBar />

      <nav className="md:hidden h-16 bg-black/95 backdrop-blur-md border-t border-white/5 flex justify-around items-center fixed bottom-0 w-full z-50 px-2 pb-1">
        <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-emerald-400' : 'text-gray-500'}`}>
          <Home strokeWidth={2} size={20} />
          <span className="text-[10px] font-medium">Trang chủ</span>
        </Link>
        <Link to="/search" className={`flex flex-col items-center gap-1 ${location.pathname === '/search' ? 'text-emerald-400' : 'text-gray-500'}`}>
          <Search strokeWidth={2} size={20} />
          <span className="text-[10px] font-medium">Tìm kiếm</span>
        </Link>
        <Link to="/library" className={`flex flex-col items-center gap-1 ${location.pathname === '/library' ? 'text-emerald-400' : 'text-gray-500'}`}>
          <Library strokeWidth={2} size={20} />
          <span className="text-[10px] font-medium">Thư viện</span>
        </Link>
        
        {/* Nút Đăng nhập trên Mobile Navigation */}
        {currentUser ? (
          <button onClick={() => { /* Tạm thời bấm vào avatar mobile thì hiện log out */ handleLogout() }} className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-[10px]">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-medium text-emerald-400">Hồ sơ</span>
          </button>
        ) : (
          <button onClick={() => setAuthOpen(true)} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
            <UserCircle strokeWidth={2} size={20} />
            <span className="text-[10px] font-medium">Tài khoản</span>
          </button>
        )}
      </nav>

      {/* Hệ thống Toast Thông Báo Toàn Cục */}
      {toastMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-[#1a1a1a] border border-emerald-500/30 text-white px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.8)] font-medium animate-fade-in flex items-center gap-3">
          <Sparkles size={20} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}
      <CreatePlaylistModal />
      <AddToPlaylistModal />
      {/* Component Đăng nhập */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setAuthOpen(false)} 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          usePlayerStore.getState().fetchLikedSongs();
        }} 
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}