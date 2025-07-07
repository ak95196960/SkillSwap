import mongoose from 'mongoose';

const skillListingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Programming',
      'Design',
      'Languages',
      'Music',
      'Cooking',
      'Photography',
      'Writing',
      'Marketing',
      'Business',
      'Fitness',
      'Crafts',
      'Other'
    ]
  },
  level: {
    type: String,
    required: [true, 'Level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  timeCommitment: {
    type: String,
    required: [true, 'Time commitment is required'],
    trim: true
  },
  availability: {
    type: String,
    required: [true, 'Availability is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  skillsWanted: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
skillListingSchema.index({ 
  title: 'text', 
  description: 'text',
  category: 'text'
});

// Index for filtering
skillListingSchema.index({ category: 1, level: 1, isActive: 1 });

export default mongoose.model('SkillListing', skillListingSchema);