require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

try {
  console.log('🚀 Starting AsifThatWorks Backend...');
  console.log('📋 Loading services...');
  
  const gatewayService = require('./src/services/gateway-service');
  console.log('✅ Gateway service loaded successfully');
  
  app.use(express.json());

  app.use('/api/v1', gatewayService);

  app.get('/', (req, res) => {
    res.send('Hello from AsifThatWorks Backend!');
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  const server = app.listen(port, () => {
    console.log(`🎯 Server running on port ${port}`);
    console.log(`🌍 Health check: http://localhost:${port}/health`);
    console.log(`💬 Test endpoint: POST http://localhost:${port}/api/v1/test-chat`);
    console.log(`🔐 OAuth: GET http://localhost:${port}/api/v1/auth/google`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

} catch (error) {
  console.error('❌ Server startup failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
