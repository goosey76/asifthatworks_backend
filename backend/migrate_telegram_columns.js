#!/usr/bin/env node

/**
 * Database Migration Script for Telegram Integration
 * Adds missing columns to the users table for Telegram integration
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔧 Database Migration for Telegram Integration');
console.log('==============================================\n');

async function runMigration() {
  let supabase;
  
  try {
    // Initialize Supabase client
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    });
    
    console.log('✅ Supabase client initialized');
    
    // Check current table structure
    console.log('\n📋 Checking current users table structure...');
    const { data: currentStructure, error: structureError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.log('❌ Error accessing users table:', structureError.message);
      return;
    }
    
    console.log('✅ Users table is accessible');
    
    // Add telegram_chat_id column if it doesn't exist
    console.log('\n🔧 Adding telegram_chat_id column...');
    
    try {
      const { error: addColumnError } = await supabase.rpc('execute_sql', {
        query: `
          ALTER TABLE public.users 
          ADD COLUMN IF NOT EXISTS telegram_chat_id text;
          
          -- Add index for better performance
          CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id 
          ON public.users(telegram_chat_id);
        `
      });
      
      if (addColumnError) {
        // Try alternative method using direct SQL execution
        console.log('⚠️ RPC method failed, trying alternative approach...');
        
        // For Supabase, we might need to use the SQL editor directly
        console.log('📝 Please run this SQL in your Supabase SQL Editor:');
        console.log('');
        console.log('```sql');
        console.log('-- Add telegram_chat_id column');
        console.log('ALTER TABLE public.users ');
        console.log('ADD COLUMN IF NOT EXISTS telegram_chat_id text;');
        console.log('');
        console.log('-- Add index for performance');
        console.log('CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id ');
        console.log('ON public.users(telegram_chat_id);');
        console.log('```');
        console.log('');
        
        console.log('💡 The migration will continue assuming the column will be added manually.');
      } else {
        console.log('✅ telegram_chat_id column added successfully');
      }
    } catch (columnError) {
      console.log('⚠️ Column addition failed:', columnError.message);
      console.log('💡 You may need to add the column manually via Supabase SQL Editor');
    }
    
    // Test the new structure
    console.log('\n🧪 Testing new structure...');
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id, email, phone_number, telegram_chat_id')
        .limit(1);
      
      if (testError) {
        if (testError.message.includes('telegram_chat_id')) {
          console.log('❌ telegram_chat_id column still missing - please add it manually');
          console.log('🔗 Open Supabase Dashboard > SQL Editor and run:');
          console.log('ALTER TABLE public.users ADD COLUMN telegram_chat_id text;');
        } else {
          console.log('❌ Error testing structure:', testError.message);
        }
      } else {
        console.log('✅ Structure test passed - telegram integration columns available');
      }
    } catch (testErr) {
      console.log('⚠️ Structure test failed:', testErr.message);
    }
    
    // Show final status
    console.log('\n📊 Migration Status:');
    console.log('✅ phone_number column: Available (from existing schema)');
    console.log('⚠️ telegram_chat_id column: Please verify it was added');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. If telegram_chat_id was not added automatically, add it manually via Supabase');
    console.log('2. Run the comprehensive test again to verify integration');
    console.log('3. Deploy your Telegram bot webhook');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the migration
if (require.main === module) {
  runMigration().then(() => {
    console.log('\n🏁 Migration script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = { runMigration };