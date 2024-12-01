const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  online: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 사용자가 오프라인이 될 때 자동으로 lastActive 업데이트
userSchema.pre('save', function(next) {
  if (this.isModified('online') && !this.online) {
    this.lastActive = new Date();
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
