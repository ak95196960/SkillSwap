import express from 'express';
import { body, validationResult } from 'express-validator';
import MatchRequest from '../models/MatchRequest.js';
import Match from '../models/Match.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Send a match request
router.post('/', authenticate, [
  body('receiverId').isMongoId().withMessage('Invalid receiver ID'),
  body('skillOffered').trim().notEmpty().withMessage('Skill offered is required'),
  body('skillWanted').trim().notEmpty().withMessage('Skill wanted is required'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
], async (req, res) => {
  try {
    console.log('Send request - Request body:', req.body);
    console.log('Send request - User ID:', req.user._id);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array(),
        details: errors.array().map(err => `${err.path}: ${err.msg}`).join(', ')
      });
    }

    const { receiverId, skillOffered, skillWanted, message } = req.body;

    // Can't send request to yourself
    if (receiverId === req.user._id.toString()) {
      console.log('User trying to send request to themselves');
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    // Check if receiver exists
    console.log('Checking if receiver exists:', receiverId);
    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.isActive) {
      console.log('Receiver not found or inactive');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Receiver found:', receiver.name);

    // Check if request already exists
    console.log('Checking for existing request...');
    const existingRequest = await MatchRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      skillOffered: skillOffered.trim(),
      skillWanted: skillWanted.trim(),
      status: 'pending'
    });

    if (existingRequest) {
      console.log('Request already exists');
      return res.status(400).json({ message: 'Request already sent for this skill combination' });
    }

    // Check if they're already matched
    console.log('Checking for existing match...');
    const existingMatch = await Match.findOne({
      $or: [
        { user1: req.user._id, user2: receiverId },
        { user1: receiverId, user2: req.user._id }
      ]
    });

    if (existingMatch) {
      console.log('Users already matched');
      return res.status(400).json({ message: 'Already matched with this user' });
    }

    // Create the request
    console.log('Creating new match request...');
    const matchRequest = new MatchRequest({
      sender: req.user._id,
      receiver: receiverId,
      skillOffered: skillOffered.trim(),
      skillWanted: skillWanted.trim(),
      message: message ? message.trim() : ''
    });

    await matchRequest.save();
    console.log('Match request saved successfully:', matchRequest._id);

    await matchRequest.populate([
      { path: 'sender', select: 'name avatar rating linkedinProfile' },
      { path: 'receiver', select: 'name avatar rating linkedinProfile' }
    ]);

    console.log('Match request populated successfully');

    res.status(201).json({
      message: 'Match request sent successfully',
      request: {
        id: matchRequest._id,
        sender: matchRequest.sender,
        receiver: matchRequest.receiver,
        skillOffered: matchRequest.skillOffered,
        skillWanted: matchRequest.skillWanted,
        message: matchRequest.message,
        status: matchRequest.status,
        createdAt: matchRequest.createdAt
      }
    });
  } catch (error) {
    console.error('Send match request error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({ 
        message: 'Duplicate request detected',
        details: `A request with the same ${duplicateField} already exists`
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    // Handle MongoDB connection errors
    if (error.name === 'MongooseError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during request creation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get received requests (for current user)
router.get('/received', authenticate, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 10 } = req.query;
    
    const query = {
      receiver: req.user._id,
      status
    };

    const requests = await MatchRequest.find(query)
      .populate('sender', 'name avatar rating linkedinProfile skillsOffered')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await MatchRequest.countDocuments(query);

    res.json({
      requests: requests.map(request => ({
        id: request._id,
        sender: request.sender,
        skillOffered: request.skillOffered,
        skillWanted: request.skillWanted,
        message: request.message,
        status: request.status,
        createdAt: request.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({ message: 'Server error during requests retrieval' });
  }
});

// Get sent requests (for current user)
router.get('/sent', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { sender: req.user._id };
    if (status) {
      query.status = status;
    }

    const requests = await MatchRequest.find(query)
      .populate('receiver', 'name avatar rating linkedinProfile')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await MatchRequest.countDocuments(query);

    res.json({
      requests: requests.map(request => ({
        id: request._id,
        receiver: request.receiver,
        skillOffered: request.skillOffered,
        skillWanted: request.skillWanted,
        message: request.message,
        status: request.status,
        createdAt: request.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Server error during requests retrieval' });
  }
});

// Accept a match request
router.put('/:id/accept', authenticate, async (req, res) => {
  try {
    console.log('=== ACCEPT REQUEST START ===');
    console.log('Request ID:', req.params.id);
    console.log('User ID:', req.user._id);
    console.log('User name:', req.user.name);

    // Validate ObjectId format first
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format');
      return res.status(400).json({ 
        message: 'Invalid request ID format',
        error: 'INVALID_ID_FORMAT'
      });
    }

    const requestId = new mongoose.Types.ObjectId(req.params.id);
    const userId = req.user._id;

    console.log('Converted IDs - Request:', requestId, 'User:', userId);

    // Find the request with comprehensive logging
    console.log('Searching for request...');
    const request = await MatchRequest.findOne({
      _id: requestId,
      receiver: userId,
      status: 'pending'
    });

    console.log('Request found:', !!request);

    if (!request) {
      console.log('Request not found, checking alternatives...');
      
      // Check if request exists at all
      const anyRequest = await MatchRequest.findById(requestId);
      console.log('Any request with this ID exists:', !!anyRequest);
      
      if (!anyRequest) {
        console.log('No request found with this ID');
        return res.status(404).json({ 
          message: 'Request not found',
          error: 'REQUEST_NOT_FOUND'
        });
      }
      
      console.log('Request details:', {
        id: anyRequest._id,
        receiver: anyRequest.receiver,
        sender: anyRequest.sender,
        status: anyRequest.status,
        currentUserId: userId
      });
      
      // Check if user is the receiver
      if (anyRequest.receiver.toString() !== userId.toString()) {
        console.log('User is not the receiver of this request');
        return res.status(403).json({ 
          message: 'Not authorized to accept this request',
          error: 'NOT_AUTHORIZED'
        });
      }
      
      // Check if request is already processed
      if (anyRequest.status !== 'pending') {
        console.log('Request already processed with status:', anyRequest.status);
        return res.status(400).json({ 
          message: `Request already ${anyRequest.status}`,
          error: 'ALREADY_PROCESSED'
        });
      }
      
      console.log('Unexpected condition - request exists but query failed');
      return res.status(500).json({ 
        message: 'Unexpected error finding request',
        error: 'QUERY_FAILED'
      });
    }

    console.log('Request found successfully:', {
      id: request._id,
      sender: request.sender,
      receiver: request.receiver,
      skillOffered: request.skillOffered,
      skillWanted: request.skillWanted,
      status: request.status
    });

    // Populate sender and receiver data
    console.log('Populating request data...');
    await request.populate([
      { path: 'sender', select: 'name avatar rating linkedinProfile' },
      { path: 'receiver', select: 'name avatar rating linkedinProfile' }
    ]);

    console.log('Request populated successfully');

    // Check if match already exists before creating
    console.log('Checking for existing match...');
    const existingMatch = await Match.findOne({
      $or: [
        { user1: request.sender._id, user2: request.receiver._id },
        { user1: request.receiver._id, user2: request.sender._id }
      ]
    });

    console.log('Existing match found:', !!existingMatch);

    // Update request status first
    console.log('Updating request status to accepted...');
    request.status = 'accepted';
    await request.save();
    console.log('Request status updated successfully');

    let match = existingMatch;

    if (!existingMatch) {
      console.log('Creating new match...');
      
      try {
        // Create a new match with proper validation
        const matchData = {
          user1: request.sender._id,
          user2: request.receiver._id,
          initiatedBy: request.sender._id,
          notes: `Skill exchange: ${request.skillOffered} for ${request.skillWanted}`,
          status: 'accepted',
          skillOffered: request.skillOffered || '',
          skillWanted: request.skillWanted || ''
        };

        console.log('Match data to create:', matchData);

        match = new Match(matchData);
        await match.save();
        console.log('Match created successfully:', match._id);

        // Add match to both users' matches array
        console.log('Updating user matches...');
        
        await User.findByIdAndUpdate(request.sender._id, {
          $addToSet: { matches: request.receiver._id }
        });

        await User.findByIdAndUpdate(request.receiver._id, {
          $addToSet: { matches: request.sender._id }
        });

        console.log('User matches updated successfully');
      } catch (matchError) {
        console.error('Error creating match:', matchError);
        console.error('Match validation error details:', matchError.errors);
        
        // Revert request status if match creation fails
        request.status = 'pending';
        await request.save();
        
        if (matchError.name === 'ValidationError') {
          const validationErrors = Object.values(matchError.errors).map(err => err.message);
          return res.status(400).json({ 
            message: 'Match validation failed', 
            error: 'MATCH_VALIDATION_ERROR',
            details: validationErrors.join(', ')
          });
        }
        
        return res.status(500).json({ 
          message: 'Failed to create match',
          error: 'MATCH_CREATION_ERROR',
          details: process.env.NODE_ENV === 'development' ? matchError.message : 'Internal server error'
        });
      }
    } else {
      console.log('Using existing match:', existingMatch._id);
    }

    console.log('=== ACCEPT REQUEST SUCCESS ===');

    // Return success response
    res.json({
      success: true,
      message: 'Match request accepted successfully',
      request: {
        id: request._id,
        sender: request.sender,
        receiver: request.receiver,
        skillOffered: request.skillOffered,
        skillWanted: request.skillWanted,
        message: request.message,
        status: request.status,
        createdAt: request.createdAt
      },
      match: {
        id: match._id,
        user1: request.sender,
        user2: request.receiver,
        status: match.status,
        createdAt: match.createdAt
      }
    });

  } catch (error) {
    console.error('=== ACCEPT REQUEST ERROR ===');
    console.error('Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      console.log('Cast error - invalid ID');
      return res.status(400).json({ 
        message: 'Invalid request ID format',
        error: 'CAST_ERROR'
      });
    }
    
    if (error.name === 'ValidationError') {
      console.log('Validation error:', error.message);
      const validationErrors = Object.values(error.errors || {}).map(err => err.message);
      return res.status(400).json({ 
        message: 'Data validation failed',
        error: 'VALIDATION_ERROR',
        details: validationErrors.join(', ') || error.message
      });
    }
    
    if (error.name === 'MongooseError' || error.name === 'MongoNetworkError') {
      console.log('Database connection error');
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: 'DATABASE_ERROR'
      });
    }
    
    if (error.code === 11000) {
      console.log('Duplicate key error');
      return res.status(400).json({ 
        message: 'Duplicate match detected',
        error: 'DUPLICATE_ERROR'
      });
    }
    
    console.log('Unexpected server error');
    res.status(500).json({ 
      message: 'Server error during request acceptance',
      error: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Decline a match request
router.put('/:id/decline', authenticate, async (req, res) => {
  try {
    console.log('=== DECLINE REQUEST START ===');
    console.log('Request ID:', req.params.id);
    console.log('User ID:', req.user._id);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format');
      return res.status(400).json({ 
        message: 'Invalid request ID format',
        error: 'INVALID_ID_FORMAT'
      });
    }

    const requestId = new mongoose.Types.ObjectId(req.params.id);
    const userId = req.user._id;

    const request = await MatchRequest.findOne({
      _id: requestId,
      receiver: userId,
      status: 'pending'
    });

    console.log('Request found for decline:', !!request);

    if (!request) {
      // Check if request exists but with different status or receiver
      const anyRequest = await MatchRequest.findById(requestId);
      
      if (!anyRequest) {
        return res.status(404).json({ 
          message: 'Request not found',
          error: 'REQUEST_NOT_FOUND'
        });
      }
      
      if (anyRequest.receiver.toString() !== userId.toString()) {
        return res.status(403).json({ 
          message: 'Not authorized to decline this request',
          error: 'NOT_AUTHORIZED'
        });
      }
      
      if (anyRequest.status !== 'pending') {
        return res.status(400).json({ 
          message: `Request already ${anyRequest.status}`,
          error: 'ALREADY_PROCESSED'
        });
      }
      
      return res.status(500).json({ 
        message: 'Unexpected error finding request',
        error: 'QUERY_FAILED'
      });
    }

    request.status = 'declined';
    await request.save();

    console.log('Request declined successfully');
    console.log('=== DECLINE REQUEST SUCCESS ===');

    res.json({
      success: true,
      message: 'Match request declined',
      request: {
        id: request._id,
        status: request.status
      }
    });
  } catch (error) {
    console.error('=== DECLINE REQUEST ERROR ===');
    console.error('Error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid request ID',
        error: 'CAST_ERROR'
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during request decline',
      error: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get request count for current user
router.get('/count', authenticate, async (req, res) => {
  try {
    const count = await MatchRequest.countDocuments({
      receiver: req.user._id,
      status: 'pending'
    });

    res.json({ count });
  } catch (error) {
    console.error('Get request count error:', error);
    res.status(500).json({ message: 'Server error during count retrieval' });
  }
});

export default router;