const mongoose = require('mongoose');

const VMSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Running', 'Stopped', 'Suspended'],
    default: 'Stopped'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specs: {
    cpu: {
      type: Number,
      required: true
    },
    ram: {
      type: Number,
      required: true
    },
    storage: {
      type: Number,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastBackup: {
    type: Date
  },
  lastStarted: {
    type: Date
  },
  lastStopped: {
    type: Date
  }
});

const VM = mongoose.model('VM', VMSchema);

module.exports = VM;