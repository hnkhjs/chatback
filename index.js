const app = require('./app');
const http = require('http');
const initializeSocket = require('./utils/io');

const server = http.createServer(app);

// Socket.IO 초기화
initializeSocket(server);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행중입니다.`);
});
