const User = require('../models/User');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const axios = require('axios');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng!' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    await newUser.save();

    res.status(201).json({ success: true, message: 'Tạo tài khoản thành công!' });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Tài khoản không tồn tại!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu không chính xác!' });
    }

    // ĐỒNG BỘ: Đổi userId thành id cho khớp với SSO
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email }, 
      process.env.JWT_SECRET || 'dluamusic_secret_key_2026', 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

const dluaSsoCallback = async (req, res) => {
  const { code } = req.body;

  try {
    // 1. Gọi trực tiếp API đổi Code lấy Token và User theo đúng tài liệu
    const dluaResponse = await axios.post('https://dlua-chat-api.onrender.com/api/auth/oauth/token', {
      code: code,
      client_id: process.env.DLUA_CLIENT_ID || 'dluamusic_client_id',
      client_secret: process.env.DLUA_CLIENT_SECRET || 'dluamusic_super_secret_123!@#'
    });

    // 2. Lấy thông tin user trả về từ response
    const chatUser = dluaResponse.data.user;
    
    // DluaChat cung cấp uniqueName và fullName
    const email = chatUser.uniqueName; 
    const name = chatUser.fullName;

    // 3. Đồng bộ dữ liệu người dùng vào Database của DLuaMusic
    let userInMusicDB = await User.findOne({ email: email });
    
    if (!userInMusicDB) {
      // Nếu chưa có, tạo tài khoản tự động
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      userInMusicDB = new User({
        name: name,
        email: email,
        password: randomPassword
      });
      await userInMusicDB.save();
    }

    // 4. Tạo token nội bộ cho DLuaMusic
    const musicPayload = {
       id: userInMusicDB._id, 
       name: userInMusicDB.name,
       email: userInMusicDB.email
    };
    
    const dLuaMusicToken = jwt.sign(musicPayload, process.env.JWT_SECRET || 'dluamusic_secret_key_2026', { expiresIn: '7d' });
    
    res.json({
      success: true,
      token: dLuaMusicToken,
      user: musicPayload
    });

  } catch (error) {
    console.error("==== LỖI ĐỔI TOKEN ====");
    console.error("Lý do:", error.response?.data || error.message);
    res.status(401).json({ success: false, message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
  }
};

module.exports = { register, login, dluaSsoCallback };