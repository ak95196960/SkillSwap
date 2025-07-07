import express from 'express';
import { body, validationResult } from 'express-validator';
import SkillListing from '../models/SkillListing.js';
import User from '../models/User.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Create skill listing
router.post('/', authenticate, [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be between 20 and 1000 characters'),
  body('category').isIn([
    'Programming', 'Design', 'Languages', 'Music', 'Cooking', 
    'Photography', 'Writing', 'Marketing', 'Business', 'Fitness', 'Crafts', 'Other'
  ]).withMessage('Invalid category'),
  body('level').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level'),
  body('timeCommitment').trim().notEmpty().withMessage('Time commitment is required'),
  body('availability').trim().notEmpty().withMessage('Availability is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
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

    const skillListing = new SkillListing({
      ...req.body,
      user: req.user._id
    });

    await skillListing.save();
    await skillListing.populate('user', 'name avatar rating completedExchanges linkedinProfile');

    res.status(201).json({
      message: 'Skill listing created successfully',
      skillListing: {
        id: skillListing._id,
        title: skillListing.title,
        description: skillListing.description,
        category: skillListing.category,
        level: skillListing.level,
        timeCommitment: skillListing.timeCommitment,
        availability: skillListing.availability,
        location: skillListing.location,
        skillsWanted: skillListing.skillsWanted,
        views: skillListing.views,
        createdAt: skillListing.createdAt,
        user: {
          id: skillListing.user._id,
          name: skillListing.user.name,
          avatar: skillListing.user.avatar,
          rating: skillListing.user.rating,
          completedExchanges: skillListing.user.completedExchanges,
          linkedinProfile: skillListing.user.linkedinProfile
        }
      }
    });
  } catch (error) {
    console.error('Create skill listing error:', error);
    res.status(500).json({ message: 'Server error during skill listing creation' });
  }
});

// Get all skill listings with search and filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      search, 
      category, 
      level, 
      location, 
      page = 1, 
      limit = 12,
      userId 
    } = req.query;

    const query = { isActive: true };

    // Build search query
    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (userId) {
      query.user = userId;
    }

    const skillListings = await SkillListing.find(query)
      .populate('user', 'name avatar rating completedExchanges linkedinProfile')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await SkillListing.countDocuments(query);

    // Find potential matches if user is authenticated
    let matches = [];
    if (req.user) {
      matches = await findPotentialMatches(req.user, skillListings);
    }

    res.json({
      skillListings: skillListings.map(listing => ({
        id: listing._id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        level: listing.level,
        timeCommitment: listing.timeCommitment,
        availability: listing.availability,
        location: listing.location,
        skillsWanted: listing.skillsWanted,
        views: listing.views,
        createdAt: listing.createdAt,
        user: {
          id: listing.user._id,
          name: listing.user.name,
          avatar: listing.user.avatar,
          rating: listing.user.rating,
          completedExchanges: listing.user.completedExchanges,
          linkedinProfile: listing.user.linkedinProfile
        },
        isMatch: matches.includes(listing._id.toString())
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get skill listings error:', error);
    res.status(500).json({ message: 'Server error during skill listings retrieval' });
  }
});

// Get skill listing by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const skillListing = await SkillListing.findById(req.params.id)
      .populate('user', 'name avatar rating completedExchanges linkedinProfile bio location');

    if (!skillListing || !skillListing.isActive) {
      return res.status(404).json({ message: 'Skill listing not found' });
    }

    // Increment view count
    skillListing.views += 1;
    await skillListing.save();

    res.json({
      skillListing: {
        id: skillListing._id,
        title: skillListing.title,
        description: skillListing.description,
        category: skillListing.category,
        level: skillListing.level,
        timeCommitment: skillListing.timeCommitment,
        availability: skillListing.availability,
        location: skillListing.location,
        skillsWanted: skillListing.skillsWanted,
        views: skillListing.views,
        createdAt: skillListing.createdAt,
        user: {
          id: skillListing.user._id,
          name: skillListing.user.name,
          avatar: skillListing.user.avatar,
          rating: skillListing.user.rating,
          completedExchanges: skillListing.user.completedExchanges,
          linkedinProfile: skillListing.user.linkedinProfile,
          bio: skillListing.user.bio,
          location: skillListing.user.location
        }
      }
    });
  } catch (error) {
    console.error('Get skill listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update skill listing
router.put('/:id', authenticate, [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be between 20 and 1000 characters'),
  body('category').optional().isIn([
    'Programming', 'Design', 'Languages', 'Music', 'Cooking', 
    'Photography', 'Writing', 'Marketing', 'Business', 'Fitness', 'Crafts', 'Other'
  ]).withMessage('Invalid category'),
  body('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const skillListing = await SkillListing.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!skillListing) {
      return res.status(404).json({ message: 'Skill listing not found or unauthorized' });
    }

    const allowedUpdates = ['title', 'description', 'category', 'level', 'timeCommitment', 'availability', 'location', 'skillsWanted'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    Object.assign(skillListing, updates);
    await skillListing.save();
    await skillListing.populate('user', 'name avatar rating completedExchanges linkedinProfile');

    res.json({
      message: 'Skill listing updated successfully',
      skillListing: {
        id: skillListing._id,
        title: skillListing.title,
        description: skillListing.description,
        category: skillListing.category,
        level: skillListing.level,
        timeCommitment: skillListing.timeCommitment,
        availability: skillListing.availability,
        location: skillListing.location,
        skillsWanted: skillListing.skillsWanted,
        views: skillListing.views,
        createdAt: skillListing.createdAt,
        user: {
          id: skillListing.user._id,
          name: skillListing.user.name,
          avatar: skillListing.user.avatar,
          rating: skillListing.user.rating,
          completedExchanges: skillListing.user.completedExchanges,
          linkedinProfile: skillListing.user.linkedinProfile
        }
      }
    });
  } catch (error) {
    console.error('Update skill listing error:', error);
    res.status(500).json({ message: 'Server error during skill listing update' });
  }
});

// Delete skill listing
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const skillListing = await SkillListing.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!skillListing) {
      return res.status(404).json({ message: 'Skill listing not found or unauthorized' });
    }

    skillListing.isActive = false;
    await skillListing.save();

    res.json({ message: 'Skill listing deleted successfully' });
  } catch (error) {
    console.error('Delete skill listing error:', error);
    res.status(500).json({ message: 'Server error during skill listing deletion' });
  }
});

// Helper function to find potential matches
async function findPotentialMatches(user, skillListings) {
  const matches = [];

  for (const listing of skillListings) {
    // Skip own listings
    if (listing.user._id.toString() === user._id.toString()) {
      continue;
    }

    // Check if the listing user has skills that current user wants
    const hasWantedSkills = user.skillsWanted.some(wantedSkill =>
      listing.title.toLowerCase().includes(wantedSkill.toLowerCase()) ||
      listing.description.toLowerCase().includes(wantedSkill.toLowerCase())
    );

    // Check if the listing user wants skills that current user offers
    const wantsOfferedSkills = listing.skillsWanted.some(wantedSkill =>
      user.skillsOffered.some(offeredSkill =>
        offeredSkill.toLowerCase().includes(wantedSkill.toLowerCase()) ||
        wantedSkill.toLowerCase().includes(offeredSkill.toLowerCase())
      )
    );

    if (hasWantedSkills && wantsOfferedSkills) {
      matches.push(listing._id.toString());
    }
  }

  return matches;
}

export default router;