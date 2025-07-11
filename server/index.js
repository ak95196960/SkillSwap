import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import skillsRoutes from './routes/skills.js';
import matchesRoutes from './routes/matches.js';
import usersRoutes from './routes/users.js';
import matchRequestsRoutes from './routes/matchRequests.js';

dotenv.config();

const app = express();
let PORT = process.env.PORT || 5001;

// Global database connection status
let isDbConnected = false;

// Ensure we're not using the same port as the client
if (PORT === 5173 || PORT === '5173') {
  console.error('❌ Server cannot use port 5173 (reserved for client). Using port 5000 instead.');
  PORT = 5000;
}

// Middleware
app.use(cors({
  origin: 'https://skillswap-frontend-hdeq.onrender.com' ,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection middleware
app.use((req, res, next) => {
  // Skip database check for health endpoint
  if (req.path === '/api/health') {
    return next();
  }
  
  // Check if database is connected for routes that need it
  if (!isDbConnected && (req.path.startsWith('/api/auth') || 
                         req.path.startsWith('/api/users') || 
                         req.path.startsWith('/api/skills') || 
                         req.path.startsWith('/api/matches'))) {
    return res.status(503).json({ 
      message: 'Database connection unavailable. Please check your MongoDB Atlas connection and try again.',
      error: 'SERVICE_UNAVAILABLE',
      details: 'The server cannot connect to the database. Please ensure your MongoDB Atlas cluster is running and accessible.'
    });
  }
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/match-requests', matchRequestsRoutes);

// Basic routes for testing
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'SkillSwap API is running!', 
    timestamp: new Date().toISOString(),
    database: isDbConnected ? 'connected' : 'disconnected',
    port: PORT,
    mongooseState: mongoose.connection.readyState,
    mongooseStates: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  
  // Handle specific MongoDB errors
  if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || err.message.includes('buffering timed out')) {
    return res.status(503).json({ 
      message: 'Database connection error. Please try again later.',
      error: 'DATABASE_ERROR',
      details: 'Unable to connect to the database. Please check your connection and try again.'
    });
  }
  
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// MongoDB Atlas Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.warn('⚠️  MONGODB_URI not found in environment variables.');
      console.warn('⚠️  Please create a .env file in the server directory with your MongoDB Atlas connection string.');
      console.warn('⚠️  Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap');
      console.warn('⚠️  Also make sure to set JWT_SECRET in your .env file.');
      return false;
    }

    if (!process.env.JWT_SECRET) {
      console.warn('⚠️  JWT_SECRET not found in environment variables.');
      console.warn('⚠️  Please add JWT_SECRET to your .env file for authentication to work.');
      console.warn('⚠️  Example: JWT_SECRET=your-super-secret-jwt-key-here');
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log('📍 Database: skillswap');
    
    // Disable buffering to get immediate errors instead of timeouts
 
    
    // Updated connection options for MongoDB Atlas with shorter timeouts
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 15000, // 15 seconds
      connectTimeoutMS: 10000, // 10 seconds connection timeout
      maxPoolSize: 5, // Reduced pool size
      minPoolSize: 1, // Reduced minimum pool size
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    });
    
    isDbConnected = true;
    console.log(`✅ MongoDB Atlas Connected Successfully!`);
    console.log(`📍 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    return true;
  } catch (error) {
    isDbConnected = false;
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('authentication failed')) {
      console.error('💡 Check your username and password in the connection string');
      console.error('💡 Make sure your MongoDB Atlas user has proper permissions');
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.error('💡 Check your internet connection and MongoDB Atlas network access');
      console.error('💡 Verify that your IP address is whitelisted in MongoDB Atlas');
      console.error('💡 Try whitelisting 0.0.0.0/0 temporarily for testing');
    } else if (error.message.includes('hostname')) {
      console.error('💡 Check your MongoDB Atlas cluster URL in the connection string');
    } else if (error.message.includes('URI must include hostname')) {
      console.error('💡 Connection string format issue - make sure it includes database name');
      console.error('💡 Format: mongodb+srv://username:password@cluster.mongodb.net/database');
    } else if (error.message.includes('serverSelectionTimeoutMS')) {
      console.error('💡 Connection timeout - check your network and MongoDB Atlas status');
      console.error('💡 Make sure your cluster is not paused in MongoDB Atlas');
    }
    
    console.warn('⚠️  Server will continue without database connection...');
    console.warn('⚠️  Database-dependent routes will return 503 Service Unavailable');
    return false;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB Atlas');
  isDbConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
  isDbConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose disconnected from MongoDB Atlas');
  isDbConnected = false;
});

// Function to find available port
const findAvailablePort = (startPort) => {
  return new Promise((resolve) => {
    const server = app.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    }).on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
};

// Start server
const startServer = async () => {
  try {
    // Try to connect to MongoDB Atlas
    const dbConnected = await connectDB();
    
    // Find available port
    const availablePort = await findAvailablePort(PORT);
    
    if (availablePort !== PORT) {
      console.log(`❌ Port ${PORT} is already in use. Using port ${availablePort}...`);
      PORT = availablePort;
    }

    const server = app.listen(PORT, () => {
      console.log('\n🚀 SkillSwap Server Started Successfully!');
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`💾 Database: ${dbConnected ? '✅ Connected to MongoDB Atlas (skillswap)' : '❌ Running without database'}`);
      
      if (dbConnected) {
        console.log(`🎯 Collections: Users, SkillListings, Matches, MatchRequests`);
        console.log(`🔐 Authentication: JWT tokens enabled`);
      } else {
        console.log(`⚠️  Database routes will return 503 until connection is established`);
        console.log(`💡 Please check your MONGODB_URI in the .env file`);
        console.log(`💡 Make sure to create a .env file in the server directory if it doesn't exist`);
        console.log(`💡 Copy .env.example to .env and fill in your MongoDB Atlas details`);
      }
      
      console.log('\n✨ Server is ready to handle requests!\n');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed.');
        if (mongoose.connection.readyState === 1) {
          mongoose.connection.close(() => {
            console.log('✅ MongoDB connection closed.');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
