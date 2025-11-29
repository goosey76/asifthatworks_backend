#!/usr/bin/env node

// Backend Health Check Script
const { createClient } = require('@supabase/supabase-js');

console.log('🏥 BACKEND HEALTH CHECK');
console.log('=' .repeat(30));

async function runDiagnostics() {
  try {
    console.log('\n1️⃣ Environment Variables...');
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'GOOGLE_CLIENT_ID'];
    let envOk = true;
    
    for (const varName of requiredEnvVars) {
      const exists = !!process.env[varName];
      console.log(`   ${varName}: ${exists ? '✅' : '❌'}`);
      if (!exists) envOk = false;
    }
    
    console.log('\n2️⃣ Database Connection...');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      console.log(`   Database: ${error ? '❌ FAILED' : '✅ OK'}`);
    } catch (dbError) {
      console.log(`   Database: ❌ ${dbError.message}`);
    }
    
    console.log('\n3️⃣ Service Imports...');
    const services = [
      { name: 'Gateway', path: './src/services/gateway-service' },
      { name: 'User', path: './src/services/user-service' },
      { name: 'JARVI', path: './src/services/jarvi-service' }
    ];
    
    for (const service of services) {
      try {
        require(service.path);
        console.log(`   ${service.name}: ✅ OK`);
      } catch (error) {
        console.log(`   ${service.name}: ❌ ${error.message}`);
      }
    }
    
    console.log('\n✅ Ready to start server!');
    console.log('Run: npm start');
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

if (require.main === module) {
  require('dotenv').config({ path: './.env' });
  runDiagnostics();
}

module.exports = { runDiagnostics };