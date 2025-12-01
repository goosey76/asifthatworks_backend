require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Track server state
let isShuttingDown = false;
let server = null;
const activeConnections = new Set();

// Request timeout configuration (30 seconds)
const REQUEST_TIMEOUT = 30000;

// Startup function with comprehensive error handling
async function startServer() {
  console.log('🚀 Starting AsifThatWorks Backend...');
  console.log('📋 Loading services...');
  
  try {
    // Load gateway service with error handling
    const gatewayService = require('./src/services/gateway-service');
    console.log('✅ Gateway service loaded successfully');
    
    // Security and stability middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Request ID and timing middleware
    app.use((req, res, next) => {
      req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      req.startTime = Date.now();
      res.setHeader('X-Request-ID', req.requestId);
      next();
    });
    
    // Shutdown check middleware
    app.use((req, res, next) => {
      if (isShuttingDown) {
        res.setHeader('Connection', 'close');
        return res.status(503).json({
          error: 'Service unavailable',
          message: 'Server is shutting down'
        });
      }
      next();
    });
    
    // Request timeout middleware
    app.use((req, res, next) => {
      req.setTimeout(REQUEST_TIMEOUT, () => {
        if (!res.headersSent) {
          console.error(`⏰ Request timeout: ${req.method} ${req.path} [${req.requestId}]`);
          res.status(408).json({
            error: 'Request Timeout',
            message: 'Request took too long to process',
            requestId: req.requestId
          });
        }
      });
      next();
    });

    // API routes
    app.use('/api/v1', gatewayService);

    // Root endpoint
    app.get('/', (req, res) => {
      res.send('Hello from AsifThatWorks Backend!');
    });

    // Enhanced health check endpoint
    app.get('/health', (req, res) => {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      
      res.json({
        status: isShuttingDown ? 'shutting_down' : 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: {
          seconds: Math.floor(uptime),
          formatted: formatUptime(uptime)
        },
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB'
        },
        activeConnections: activeConnections.size
      });
    });

    // 404 handler for unknown routes
    app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        requestId: req.requestId
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      const duration = Date.now() - (req.startTime || Date.now());
      console.error(`❌ Error in ${req.method} ${req.path} [${req.requestId}] (${duration}ms):`, err.message);
      console.error('Stack:', err.stack);
      
      // Don't expose internal errors in production
      const isProduction = process.env.NODE_ENV === 'production';
      
      res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: isProduction ? 'An unexpected error occurred' : err.message,
        requestId: req.requestId,
        ...(isProduction ? {} : { stack: err.stack })
      });
    });

    // Start server
    server = app.listen(port, () => {
      console.log(`🎯 Server running on port ${port}`);
      console.log(`🌍 Health check: http://localhost:${port}/health`);
      console.log(`💬 Test endpoint: POST http://localhost:${port}/api/v1/test-chat`);
      console.log(`🔐 OAuth: GET http://localhost:${port}/api/v1/auth/google`);
      console.log(`📈 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Track connections for graceful shutdown
    server.on('connection', (conn) => {
      activeConnections.add(conn);
      conn.on('close', () => activeConnections.delete(conn));
    });

    // Server error handling
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
      } else if (error.code === 'EACCES') {
        console.error(`❌ Port ${port} requires elevated privileges`);
      } else {
        console.error('❌ Server error:', error.message);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Graceful shutdown function
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    console.log('⚠️ Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;
  console.log(`\n🛑 ${signal} received, starting graceful shutdown...`);
  
  // Give active requests time to complete (15 seconds max)
  const shutdownTimeout = setTimeout(() => {
    console.log('⚠️ Shutdown timeout reached, forcing exit...');
    process.exit(1);
  }, 15000);
  
  try {
    // Stop accepting new connections
    if (server) {
      console.log('📊 Closing server to new connections...');
      
      await new Promise((resolve) => {
        server.close((err) => {
          if (err) {
            console.error('Error closing server:', err.message);
          }
          resolve();
        });
      });
      
      // Close active connections gracefully
      console.log(`📊 Closing ${activeConnections.size} active connections...`);
      for (const conn of activeConnections) {
        conn.end();
      }
      
      // Wait a moment for connections to close
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force destroy remaining connections
      for (const conn of activeConnections) {
        conn.destroy();
      }
    }
    
    clearTimeout(shutdownTimeout);
    console.log('✅ Server shutdown complete');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

// Format uptime helper
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}

// Signal handlers for graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  
  // Log but don't exit immediately - give time to handle ongoing requests
  if (!isShuttingDown) {
    gracefulShutdown('uncaughtException');
  }
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Promise Rejection:', reason);
  // Don't exit for unhandled rejections, just log them
});

// Start the server
startServer();
