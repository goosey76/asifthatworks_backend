// start_server.js
// Simple server startup script with port conflict handling

const net = require('net');
const { spawn } = require('child_process');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, (err) => {
      if (err) {
        resolve(false);
      } else {
        server.close();
        resolve(true);
      }
    });
    server.on('error', () => resolve(false));
  });
}

async function startServer() {
  const defaultPort = 3000;
  const altPort = 3001;

  console.log('🚀 Starting AsifThatWorks Backend...\n');

  // Check if default port is available
  const portAvailable = await checkPort(defaultPort);
  
  if (portAvailable) {
    console.log(`✅ Port ${defaultPort} is available`);
    console.log(`🌍 Starting server on port ${defaultPort}...\n`);
    
    // Start server with default port
    const server = spawn('node', ['server.js'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, PORT: defaultPort }
    });

    server.on('error', (err) => {
      console.error('❌ Server startup error:', err);
    });

    return;
  }

  // Try alternative port
  const altAvailable = await checkPort(altPort);
  
  if (altAvailable) {
    console.log(`⚠️  Port ${defaultPort} is in use`);
    console.log(`✅ Port ${altPort} is available`);
    console.log(`🌍 Starting server on port ${altPort} instead...\n`);
    
    const server = spawn('node', ['server.js'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, PORT: altPort }
    });

    server.on('error', (err) => {
      console.error('❌ Server startup error:', err);
    });

    return;
  }

  console.log(`❌ Both ports ${defaultPort} and ${altPort} are in use`);
  console.log('Please free up one of these ports and try again.');
  process.exit(1);
}

startServer().catch(console.error);
