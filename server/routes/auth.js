import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('linkedinProfile')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please enter a valid LinkedIn profile URL')
    .custom((value) => {
      // More flexible LinkedIn URL validation
      const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9\-_.]+\/?$/;
      if (!linkedinRegex.test(value)) {
        throw new Error('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourname)');
      }
      return true;
    })
], async (req, res) => {
  try {
    console.log('Registration attempt received:', {
      name: req.body.name,
      email: req.body.email,
      linkedinProfile: req.body.linkedinProfile
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array(),
        details: errors.array().map(err => `${err.path}: ${err.msg}`).join(', ')
      });
    }

    const { name, email, password, linkedinProfile } = req.body;

    // Check if user already exists
    console.log('Checking if user exists with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    console.log('Creating new user...');
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      linkedinProfile: linkedinProfile.trim(),
      skillsOffered: [],
      skillsWanted: [],
      bio: '',
      location: '',
      avatar: '',
      rating: 0,
      completedExchanges: 0,
      matches: [],
      isActive: true
    });

    await user.save();
    console.log('User created successfully:', user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
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
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    // Handle MongoDB connection errors
    if (error.name === 'MongooseError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.' 
      });
    }

    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).populate('matches');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('matches');
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
        completedExchanges: user.completedExchanges,
        matches: user.matches
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;