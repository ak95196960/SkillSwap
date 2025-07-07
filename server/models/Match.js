import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillListing',
    required: false // Made optional since we're creating direct user matches
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'accepted' // Changed default to 'accepted' for match requests
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: '' // Added default empty string
  },
  skillOffered: {
    type: String,
    trim: true,
    default: '' // Added for match request context
  },
  skillWanted: {
    type: String,
    trim: true,
    default: '' // Added for match request context
  }
}, {
  timestamps: true
});

// Remove the unique constraint that was causing issues
// matchSchema.index({ user1: 1, user2: 1 }, { unique: true });

// Add a compound index for better performance without uniqueness constraint
matchSchema.index({ user1: 1, user2: 1, status: 1 });

// Add validation to prevent self-matching
matchSchema.pre('save', function(next) {
  if (this.user1.toString() === this.user2.toString()) {
    const error = new Error('Users cannot match with themselves');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

export default mongoose.model('Match', matchSchema);