const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// 메시지 저장
router.post('/', messageController.saveMessage);

// 메시지 목록 조회
router.get('/', messageController.getMessages);

// 특정 사용자의 메시지 조회
router.get('/user/:userId', messageController.getUserMessages);

// 메시지 삭제
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
