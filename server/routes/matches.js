import express from 'express';
import { body, validationResult } from 'express-validator';
import Match from '../models/Match.js';
import SkillListing from '../models/SkillListing.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create a match
router.post('/', authenticate, [
  body('skillListingId').isMongoId().withMessage('Invalid skill listing ID'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { skillListingId, notes } = req.body;

    // Find the skill listing
    const skillListing = await SkillListing.findById(skillListingId).populate('user');
    if (!skillListing || !skillListing.isActive) {
      return res.status(404).json({ message: 'Skill listing not found' });
    }

    // Can't match with own listing
    if (skillListing.user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot match with your own listing' });
    }

    // Check if match already exists
    const existingMatch = await Match.findOne({
      $or: [
        { user1: req.user._id, user2: skillListing.user._id, skillListing: skillListingId },
        { user1: skillListing.user._id, user2: req.user._id, skillListing: skillListingId }
      ]
    });

    if (existingMatch) {
      return res.status(400).json({ message: 'Match already exists for this skill listing' });
    }

    // Create the match
    const match = new Match({
      user1: req.user._id,
      user2: skillListing.user._id,
      skillListing: skillListingId,
      initiatedBy: req.user._id,
      notes
    });

    await match.save();

    // Add match to both users' matches array
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { matches: skillListingId }
    });

    await User.findByIdAndUpdate(skillListing.user._id, {
      $addToSet: { matches: skillListingId }
    });

    await match.populate([
      { path: 'user1', select: 'name avatar rating linkedinProfile' },
      { path: 'user2', select: 'name avatar rating linkedinProfile' },
      { path: 'skillListing', select: 'title category level' }
    ]);

    res.status(201).json({
      message: 'Match created successfully',
      match: {
        id: match._id,
        user1: match.user1,
        user2: match.user2,
        skillListing: match.skillListing,
        status: match.status,
        initiatedBy: match.initiatedBy,
        notes: match.notes,
        createdAt: match.createdAt
      }
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ message: 'Server error during match creation' });
  }
});

// Get user's matches
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ]
    };

    if (status) {
      query.status = status;
    }

    const matches = await Match.find(query)
      .populate('user1', 'name avatar rating linkedinProfile')
      .populate('user2', 'name avatar rating linkedinProfile')
      .populate('skillListing', 'title category level description')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Match.countDocuments(query);

    res.json({
      matches: matches.map(match => ({
        id: match._id,
        user1: match.user1,
        user2: match.user2,
        skillListing: match.skillListing,
        status: match.status,
        initiatedBy: match.initiatedBy,
        notes: match.notes,
        createdAt: match.createdAt,
        otherUser: match.user1._id.toString() === req.user._id.toString() ? match.user2 : match.user1
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Server error during matches retrieval' });
  }
});

// Update match status
router.put('/:id/status', authenticate, [
  body('status').isIn(['pending', 'accepted', 'declined', 'completed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status } = req.body;

    const match = await Match.findOne({
      _id: req.params.id,
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ]
    }).populate([
      { path: 'user1', select: 'name avatar rating linkedinProfile' },
      { path: 'user2', select: 'name avatar rating linkedinProfile' },
      { path: 'skillListing', select: 'title category level' }
    ]);

    if (!match) {
      return res.status(404).json({ message: 'Match not found or unauthorized' });
    }

    match.status = status;
    await match.save();

    // If match is completed, increment completed exchanges for both users
    if (status === 'completed') {
      await User.findByIdAndUpdate(match.user1._id, {
        $inc: { completedExchanges: 1 }
      });
      await User.findByIdAndUpdate(match.user2._id, {
        $inc: { completedExchanges: 1 }
      });
    }

    res.json({
      message: 'Match status updated successfully',
      match: {
        id: match._id,
        user1: match.user1,
        user2: match.user2,
        skillListing: match.skillListing,
        status: match.status,
        initiatedBy: match.initiatedBy,
        notes: match.notes,
        createdAt: match.createdAt
      }
    });
  } catch (error) {
    console.error('Update match status error:', error);
    res.status(500).json({ message: 'Server error during match status update' });
  }
});

// Delete match
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.id,
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ]
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found or unauthorized' });
    }

    // Remove match from users' matches arrays
    await User.findByIdAndUpdate(match.user1, {
      $pull: { matches: match.skillListing }
    });

    await User.findByIdAndUpdate(match.user2, {
      $pull: { matches: match.skillListing }
    });

    await Match.findByIdAndDelete(req.params.id);

    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({ message: 'Server error during match deletion' });
  }
});

export default router;