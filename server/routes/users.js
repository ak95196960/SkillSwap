import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Update user profile
router.put('/profile', authenticate, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('location').optional().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  body('linkedinProfile').optional().isURL().withMessage('Please enter a valid LinkedIn profile URL')
    .matches(/^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/)
    .withMessage('Please enter a valid LinkedIn profile URL'),
  body('skillsOffered').optional().isArray().withMessage('Skills offered must be an array'),
  body('skillsWanted').optional().isArray().withMessage('Skills wanted must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const allowedUpdates = ['name', 'bio', 'location', 'linkedinProfile', 'skillsOffered', 'skillsWanted', 'avatar'];
    const updates = {};

    // Only include allowed fields that are present in the request
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).populate('matches');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        linkedinProfile: user.linkedinProfile,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        rating: user.rating,
        completedExchanges: user.completedExchanges,
        matches: user.matches
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        linkedinProfile: user.linkedinProfile,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        rating: user.rating,
        completedExchanges: user.completedExchanges
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/', async (req, res) => {
  try {
    const { search, skills, location, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skillsOffered: { $in: [new RegExp(search, 'i')] } },
        { skillsWanted: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query.skillsOffered = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        rating: user.rating,
        completedExchanges: user.completedExchanges
      })),
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error during user search' });
  }
});

export default router;