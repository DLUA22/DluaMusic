import { create } from 'zustand';
import apiClient from '../services/api';

const usePlayerStore = create((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [], 
  currentIndex: -1,

  isShuffle: false, 
  repeatMode: 'off', 
  likedSongsList: [], 
  
  // TÍNH NĂNG MỚI: QUẢN LÝ PLAYLIST CÁ NHÂN
  myPlaylists: [],
  isCreatePlaylistOpen: false,
  setCreatePlaylistOpen: (status) => set({ isCreatePlaylistOpen: status }),
  
  isAddToPlaylistOpen: false,
  songToAdd: null,
  openAddToPlaylist: (song) => set({ isAddToPlaylistOpen: true, songToAdd: song }),
  closeAddToPlaylist: () => set({ isAddToPlaylistOpen: false, songToAdd: null }),

  isPlaylistMode: false,

  toastMessage: '',
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => set({ toastMessage: '' }), 3000);
  },
  isAuthOpen: false,
  setAuthOpen: (status) => set({ isAuthOpen: status }),

  fetchLikedSongs: async () => {
    const token = localStorage.getItem('dlua_token');
    if (token) {
      try {
        const res = await apiClient.get('/user/liked');
        set({ likedSongsList: res.data.likedSongs });
      } catch (error) {}
    } else {
      set({ likedSongsList: [] });
    }
  },

  // TÍNH NĂNG MỚI: TẢI DANH SÁCH PLAYLIST CÁ NHÂN
  fetchMyPlaylists: async () => {
    const token = localStorage.getItem('dlua_token');
    if (token) {
      try {
        const res = await apiClient.get('/playlists');
        set({ myPlaylists: res.data.playlists });
      } catch (error) {}
    } else {
      set({ myPlaylists: [] });
    }
  },

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => set((state) => {
    const nextMode = state.repeatMode === 'off' ? 'all' : (state.repeatMode === 'all' ? 'one' : 'off');
    return { repeatMode: nextMode };
  }),
  setLikedSongsList: (list) => set({ likedSongsList: list }),

  setCurrentSong: (song) => set((state) => {
    const newQueue = state.isPlaylistMode ? [song] : [...state.queue, song];
    return { 
      currentSong: song, 
      isPlaying: true, 
      queue: newQueue, 
      currentIndex: newQueue.length - 1,
      isPlaylistMode: false
    };
  }),

  setQueue: (songs, startIndex = 0) => set({
    queue: songs,
    currentSong: songs[startIndex],
    currentIndex: startIndex,
    isPlaying: true,
    isPlaylistMode: true
  }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (status) => set({ isPlaying: status }), 

  playPrev: () => set((state) => {
    if (state.queue.length === 0 || state.currentIndex === 0) return state; 
    const prevIndex = state.currentIndex - 1;
    return { currentIndex: prevIndex, currentSong: state.queue[prevIndex], isPlaying: true };
  }),

  playNext: () => set((state) => {
    if (state.queue.length === 0 || state.currentIndex === state.queue.length - 1) return state; 
    const nextIndex = state.currentIndex + 1;
    return { currentIndex: nextIndex, currentSong: state.queue[nextIndex], isPlaying: true };
  }),

  playSmartNext: async () => {
    const state = get();
    
    // 1. Chế độ Trộn bài (Shuffle)
    if (state.isShuffle && state.queue.length > 1) {
      let randomIndex = state.currentIndex;
      while (randomIndex === state.currentIndex) randomIndex = Math.floor(Math.random() * state.queue.length);
      set({ currentIndex: randomIndex, currentSong: state.queue[randomIndex], isPlaying: true });
      return;
    }

    // 2. Chuyển bài bình thường trong danh sách
    if (state.currentIndex < state.queue.length - 1) {
      state.playNext();
      return;
    }

    // 3. Chế độ lặp lại toàn bộ danh sách
    if (state.repeatMode === 'all' && state.queue.length > 0) {
      set({ currentIndex: 0, currentSong: state.queue[0], isPlaying: true });
      return;
    }

    // 4. Nếu đang nghe Playlist cố định thì hết bài là dừng
    if (state.isPlaylistMode) {
      set({ isPlaying: false });
      return;
    }

    // 5. CHẾ ĐỘ AI GỢI Ý ĐƯỢC NÂNG CẤP
    if (state.currentSong) {
      try {
        // KHẮC PHỤC LỖI ID: Bắt cả youtubeId hoặc id để không bao giờ bị rỗng
        const targetId = state.currentSong.youtubeId || state.currentSong.id;
        
        // Lấy lịch sử 5 bài gần nhất (cũng phải check cả 2 loại ID)
        const recentHistoryIds = state.queue.slice(Math.max(0, state.queue.length - 5))
                                            .map(s => s.youtubeId || s.id)
                                            .join(',');
                                            
        const response = await apiClient.get(`/songs/recommend?currentSongId=${targetId}&history=${recentHistoryIds}`);
        
        if (response.data && response.data.data) {
          // Nếu AI tìm được bài -> Hát tiếp!
          state.setCurrentSong(response.data.data); 
        } else {
          // NẾU KHÔNG TÌM ĐƯỢC: Vòng lại bài đầu tiên trong hàng đợi thay vì tắt nhạc
          console.warn("AI không tìm thấy bài, tự động quay lại đầu hàng đợi.");
          if (state.queue.length > 0) {
            set({ currentIndex: 0, currentSong: state.queue[0], isPlaying: true });
          } else {
            set({ isPlaying: false });
          }
        }
      } catch (error) {
        console.error("Lỗi AI Gợi ý:", error);
        // NẾU LỖI MẠNG / LỖI SERVER: Vẫn kiên quyết hát bài ngẫu nhiên thay vì tắt
        if (state.queue.length > 0) {
          const fallbackIndex = Math.floor(Math.random() * state.queue.length);
          set({ currentIndex: fallbackIndex, currentSong: state.queue[fallbackIndex], isPlaying: true });
        } else {
          set({ isPlaying: false });
        }
      }
    }
  }
}));

export default usePlayerStore;