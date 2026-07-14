import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Mail, Lock, Eye, EyeOff, User, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import apiClient from '../services/api';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Yếu', color: 'bg-red-500' });
  
  const [formError, setFormError] = useState({ field: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isDLuaLoading, setIsDLuaLoading] = useState(false); // Trạng thái loading riêng cho DLuaChat
  const [toastMsg, setToastMsg] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const currentPassword = watch('password', '');

  const checkPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) setPasswordStrength({ score, label: 'Yếu', color: 'bg-red-500 text-red-500' });
    else if (score === 3 || score === 4) setPasswordStrength({ score, label: 'Trung bình', color: 'bg-yellow-400 text-yellow-400' });
    else setPasswordStrength({ score, label: 'Mạnh', color: 'bg-emerald-500 text-emerald-500' });
  };

  const onSubmit = async (data) => {
    setFormError({ field: '', message: '' }); 
    
    if (!isLogin && passwordStrength.score <= 2) {
      setFormError({ field: 'password', message: 'Mật khẩu quá yếu! Vui lòng đạt tối thiểu mức Trung bình.' });
      return;
    }
    if (!isLogin && data.password !== data.confirmPassword) {
      setFormError({ field: 'confirmPassword', message: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await apiClient.post('/auth/login', {
          email: data.email,
          password: data.password
        });
        
        localStorage.setItem('dlua_token', response.data.token);
        localStorage.setItem('dlua_user', JSON.stringify(response.data.user));
        
        setToastMsg(`Chào mừng ${response.data.user.name} trở lại!`);
        setTimeout(() => {
          setToastMsg('');
          if (onLoginSuccess) onLoginSuccess(response.data.user);
          onClose(); 
        }, 1500);

      } else {
        const response = await apiClient.post('/auth/register', {
          name: data.name,
          email: data.email,
          password: data.password
        });
        
        setToastMsg('Tạo tài khoản thành công! Đang chuyển sang đăng nhập...');
        setTimeout(() => {
          setToastMsg('');
          setIsLogin(true); 
        }, 1500);
      }
    } catch (error) {
      console.error("Lỗi Auth:", error);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau!';
      
      if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('tài khoản')) {
        setFormError({ field: 'email', message: errorMsg });
      } else if (errorMsg.toLowerCase().includes('mật khẩu')) {
        setFormError({ field: 'password', message: errorMsg });
      } else {
        setFormError({ field: 'email', message: errorMsg }); 
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HÀM XỬ LÝ ĐĂNG NHẬP BẰNG DLUACHAT
  // ==========================================
  const handleDLuaChatLogin = () => {
    const clientId = 'dlua_music_client_id_123'; 
    const redirectUri = encodeURIComponent(window.location.origin);
    const dluaChatAuthUrl = `https://dlua-chat.vercel.app/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    
    window.location.href = dluaChatAuthUrl;
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-4">
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* THANH THÔNG BÁO XỊN XÒ (TOAST) */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-2 rounded-full shadow-lg font-medium animate-fade-in flex items-center gap-2 w-max max-w-[90%]">
            <Sparkles size={18} />
            <span className="truncate">{toastMsg}</span>
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
          <X size={24} />
        </button>

        <div className="flex text-lg font-bold border-b border-white/10">
          <div 
            onClick={() => { setIsLogin(true); setFormError({field: '', message: ''}); }}
            className={`flex-1 text-center py-5 cursor-pointer transition-colors ${isLogin ? 'text-white border-b-2 border-emerald-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Đăng nhập
          </div>
          <div 
            onClick={() => { setIsLogin(false); setFormError({field: '', message: ''}); }}
            className={`flex-1 text-center py-5 cursor-pointer transition-colors ${!isLogin ? 'text-white border-b-2 border-emerald-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Đăng ký
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-extrabold text-white mb-6 text-center">
            {isLogin ? 'Chào mừng trở lại!' : 'Bắt đầu hành trình'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  {...register("name", { required: !isLogin })}
                  type="text" placeholder="Tên hiển thị" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-emerald-500 focus:bg-white/10 outline-none transition-all"
                />
              </div>
            )}

            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                  type="email" placeholder="Email của bạn" 
                  className={`w-full bg-white/5 border ${formError.field === 'email' ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-emerald-500 focus:bg-white/10 outline-none transition-all`}
                />
              </div>
              {formError.field === 'email' && <p className="text-[13px] text-red-500 mt-1.5 ml-1 font-medium">{formError.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  {...register("password", { required: true, onChange: (e) => checkPasswordStrength(e.target.value) })}
                  type={showPassword ? "text" : "password"} placeholder="Mật khẩu" 
                  className={`w-full bg-white/5 border ${formError.field === 'password' ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:border-emerald-500 focus:bg-white/10 outline-none transition-all`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formError.field === 'password' && <p className="text-[13px] text-red-500 mt-1.5 ml-1 font-medium">{formError.message}</p>}
            </div>

            {!isLogin && currentPassword.length > 0 && (
              <div className="px-1 mt-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-400">Độ bảo mật:</span>
                  <span className={`text-xs font-bold ${passwordStrength.color.split(' ')[1]}`}>{passwordStrength.label}</span>
                </div>
                <div className="flex gap-1 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} style={{ width: '33.33%' }}></div>
                  <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} style={{ width: '33.33%' }}></div>
                  <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 5 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} style={{ width: '33.33%' }}></div>
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    {...register("confirmPassword", { required: !isLogin })}
                    type={showConfirmPassword ? "text" : "password"} placeholder="Xác nhận lại mật khẩu" 
                    className={`w-full bg-white/5 border ${formError.field === 'confirmPassword' ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:border-emerald-500 focus:bg-white/10 outline-none transition-all`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formError.field === 'confirmPassword' && <p className="text-[13px] text-red-500 mt-1.5 ml-1 font-medium">{formError.message}</p>}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading || (!isLogin && passwordStrength.score <= 2)}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-6 ${(isLoading || (!isLogin && passwordStrength.score <= 2)) ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-emerald-500 hover:bg-emerald-400 hover:scale-[1.02] active:scale-95'}`}
            >
              {isLoading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-white/10 w-full"></div>
              <span className="bg-[#121212] px-4 text-xs text-gray-500 uppercase tracking-widest absolute">Hoặc tiếp tục với</span>
            </div>
            
            {/* NÚT DLUACHAT NỔI BẬT LÊN TRÊN */}
            <button 
              type="button"
              onClick={handleDLuaChatLogin}
              disabled={isDLuaLoading}
              className="w-full mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all font-bold shadow-lg disabled:opacity-70 disabled:scale-100 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isDLuaLoading ? <Loader2 size={20} className="animate-spin" /> : <MessageSquare size={20} fill="currentColor" />}
              Tiếp tục với DLuaChat
            </button>

            {/* Các nút mạng xã hội khác */}
            <div className="flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2]/10 border border-[#1877F2]/30 text-[#1877F2] py-3 rounded-xl hover:bg-[#1877F2] hover:text-white transition-all font-medium hover:scale-[1.02] active:scale-[0.98]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-xl hover:bg-white hover:text-black transition-all font-medium hover:scale-[1.02] active:scale-[0.98]">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;