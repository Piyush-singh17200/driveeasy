require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectMongoDB = require('./config/mongodb');
const { connectPostgres } = require('./config/postgres');
const logger = require('./utils/logger');
const socketHandler = require('./services/socketService');
const { stripeWebhook } = require('./controllers/paymentController');

// Route imports
const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { error: 'Too many requests, please try again later.' },
});

// Middleware
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});
app.use(compression());
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean)
  || [process.env.CLIENT_URL || 'http://localhost:5173'];
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
}));

// Stripe webhooks must receive the raw body before JSON parsing mutates req.body.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Socket.io handler
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📡 Socket.io ready`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`❌ Port ${PORT} is already in use. Please kill the process or use a different port.`);
      process.exit(1);
    } else {
      logger.error('Server error:', err);
    }
  });

  try {
    const mongoReady = await connectMongoDB();
    if (!mongoReady) {
      logger.warn('Continuing startup without MongoDB. Some API features may be unavailable.');
    }

    await connectPostgres();
  } catch (error) {
    logger.error('Startup initialization warning:', error);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, server };
