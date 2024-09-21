// backend/src/models/vm.model.js

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
      required: false
    },
    ram: {
      type: Number,
      required: false
    },
    storage: {
      type: Number,
      required: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastBackup: {
    type: Date
  }
});

const VM = mongoose.model('VM', VMSchema);

module.exports = VM;