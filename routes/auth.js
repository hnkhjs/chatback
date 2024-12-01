const express = require('express');
const router = express.Router();
const User = require('../models/user');
const crypto = require('crypto');

// 로그인/회원가입
router.post('/login', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: '이름을 입력해주세요.' });
    }

    const trimmedName = name.trim();

    // 기존 사용자 찾기
    let user = await User.findOne({ name: trimmedName });
    
    if (!user) {
      // 새로운 토큰 생성
      const token = crypto.randomBytes(32).toString('hex');
      
      // 새 사용자 생성
      user = new User({
        name: trimmedName,
        token,
        online: true
      });
      await user.save();
      
      console.log('새 사용자 생성:', user.name);
    } else {
      // 기존 사용자의 토큰 갱신
      user.token = crypto.randomBytes(32).toString('hex');
      user.online = true;
      await user.save();
      
      console.log('기존 사용자 로그인:', user.name);
    }

    // 응답 데이터
    res.json({
      userId: user._id,
      name: user.name,
      token: user.token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 로그아웃
router.post('/logout', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: '토큰이 필요합니다.' });
    }

    const user = await User.findOne({ token });
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    user.online = false;
    await user.save();

    res.json({ message: '로그아웃 되었습니다.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
