const Chat = require('../models/chat');
const User = require('../models/user');

// 메시지 저장
exports.saveMessage = async (req, res) => {
  try {
    const { userId, text } = req.body;
    
    // 사용자 확인
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 메시지 생성
    const message = new Chat({
      user: {
        id: user._id,
        name: user.name
      },
      text,
      timestamp: new Date()
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('메시지 저장 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 메시지 목록 조회
exports.getMessages = async (req, res) => {
  try {
    const { limit = 50, before } = req.query;
    
    let query = {};
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const messages = await Chat.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('user.id', 'name');

    res.json(messages.reverse());
  } catch (error) {
    console.error('메시지 조회 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 사용자의 메시지 조회
exports.getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await Chat.find({ 'user.id': userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(messages);
  } catch (error) {
    console.error('사용자 메시지 조회 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 메시지 삭제
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    const message = await Chat.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: '메시지를 찾을 수 없습니다.' });
    }

    // 메시지 작성자 확인
    if (message.user.id.toString() !== userId) {
      return res.status(403).json({ message: '메시지를 삭제할 권한이 없습니다.' });
    }

    await message.remove();
    res.json({ message: '메시지가 삭제되었습니다.' });
  } catch (error) {
    console.error('메시지 삭제 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
