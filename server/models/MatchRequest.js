import mongoose from 'mongoose';

const matchRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillOffered: {
    type: String,
    required: true,
    trim: true
  },
  skillWanted: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure unique requests between users for same skill combination
matchRequestSchema.index({ 
  sender: 1, 
  receiver: 1, 
  skillOffered: 1, 
  skillWanted: 1 
}, { unique: true });

export default mongoose.model('MatchRequest', matchRequestSchema);