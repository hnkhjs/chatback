const { Server } = require('socket.io');
const User = require('../models/user');
const Chat = require('../models/chat');

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // 연결된 소켓과 사용자 ID를 매핑하는 Map
  const socketToUser = new Map();

  // 온라인 사용자 목록 브로드캐스트
  async function broadcastOnlineUsers() {
    try {
      const onlineUsers = await User.find({ online: true })
        .select('name _id')
        .lean();
      io.emit('onlineUsers', onlineUsers);
    } catch (error) {
      console.error('Error broadcasting online users:', error);
    }
  }

  io.on('connection', async (socket) => {
    console.log('새로운 소켓 연결:', socket.id);

    // 인증 처리
    socket.on('authenticate', async ({ token }) => {
      try {
        const user = await User.findOne({ token });
        
        if (!user) {
          socket.emit('error', { message: '인증 실패' });
          return;
        }

        // 소켓-사용자 매핑 저장
        socketToUser.set(socket.id, user._id);
        
        // 사용자 온라인 상태 업데이트
        user.online = true;
        await user.save();

        // 시스템 메시지 저장 및 전송
        const systemMessage = new Chat({
          userId: user._id,
          name: user.name,
          text: `${user.name}님이 입장하셨습니다.`,
          type: 'system'
        });
        await systemMessage.save();

        // 최근 메시지 전송
        const recentMessages = await Chat.find()
          .sort({ timestamp: -1 })
          .limit(50)
          .lean();
        socket.emit('recentMessages', recentMessages.reverse());

        // 온라인 사용자 목록 업데이트
        await broadcastOnlineUsers();

        console.log(`${user.name} 인증 성공`);
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('error', { message: '서버 오류가 발생했습니다.' });
      }
    });

    // 채팅 메시지 처리
    socket.on('chatMessage', async (message) => {
      try {
        const userId = socketToUser.get(socket.id);
        const user = await User.findById(userId);

        if (!user) {
          socket.emit('error', { message: '인증되지 않은 사용자입니다.' });
          return;
        }

        const chat = new Chat({
          userId: user._id,
          name: user.name,
          text: message,
          type: 'chat'
        });
        await chat.save();

        io.emit('newMessage', chat);
      } catch (error) {
        console.error('Message error:', error);
        socket.emit('error', { message: '메시지 전송 실패' });
      }
    });

    // 연결 종료 처리
    socket.on('disconnect', async () => {
      try {
        const userId = socketToUser.get(socket.id);
        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            // 시스템 메시지 저장 및 전송
            const systemMessage = new Chat({
              userId: user._id,
              name: user.name,
              text: `${user.name}님이 퇴장하셨습니다.`,
              type: 'system'
            });
            await systemMessage.save();
            io.emit('newMessage', systemMessage);

            // 사용자 오프라인 상태 업데이트
            user.online = false;
            await user.save();

            // 소켓-사용자 매핑 제거
            socketToUser.delete(socket.id);

            // 온라인 사용자 목록 업데이트
            await broadcastOnlineUsers();
          }
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });

  return io;
}

module.exports = initializeSocket;
