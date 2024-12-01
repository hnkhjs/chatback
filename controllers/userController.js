const User = require('../models/user');
const crypto = require('crypto');

// 사용자 등록/로그인
exports.loginUser = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: '이름을 입력해주세요.' });
    }

    // 기존 사용자 찾기
    let user = await User.findOne({ name });
    
    if (!user) {
      // 새로운 토큰 생성
      const token = crypto.randomBytes(32).toString('hex');
      
      // 새 사용자 생성
      user = await User.create({
        name,
        token,
        online: true
      });
    } else {
      // 기존 사용자의 online 상태와 토큰 업데이트
      user.online = true;
      user.token = crypto.randomBytes(32).toString('hex');
      await user.save();
    }

    res.json({
      userId: user._id,
      name: user.name,
      token: user.token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 로그아웃
exports.logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId가 필요합니다.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    user.online = false;
    user.token = null;
    await user.save();

    res.json({ message: '로그아웃 되었습니다.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 온라인 사용자 목록 조회
exports.getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await User.find({ online: true }, 'name');
    res.json(onlineUsers);
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자 정보 조회
exports.getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId, 'name online');
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자 삭제
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ message: '사용자가 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
