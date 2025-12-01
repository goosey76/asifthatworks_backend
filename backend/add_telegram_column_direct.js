u#!/usr/bin/env node

/**
 * Direct SQL execution to add telegram_chat_id column
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // We might need service role key

console.log('🔧 Direct SQL Column Addition');
console.log('=============================\n');

async function addColumnDirectly() {
  try {
    // Try with anon key first, then service role if needed
    let supabase;
    let authKey = process.env.SUPABASE_ANON_KEY;
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      authKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      console.log('📋 Using service role key for admin operations');
    }
    
    supabase = createClient(supabaseUrl, authKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    });
    
    console.log('✅ Supabase client initialized');
    
    // Test current column existence
    console.log('\n🧪 Testing current schema...');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, phone_number')
        .eq('email', 'trashbot7676@gmail.com')
        .single();
      
      if (error && error.code === 'PGRST116') {
        console.log('❌ User not found');
        return;
      } else if (error) {
        console.log('❌ Error querying user:', error.message);
        return;
      }
      
      console.log('✅ Found existing user:', data.email);
      console.log('   ID:', data.id);
      console.log('   Phone:', data.phone_number || 'Not set');
      
      // Check if telegram_chat_id exists
      try {
        const { data: telegramData, error: telegramError } = await supabase
          .from('users')
          .select('telegram_chat_id')
          .eq('id', data.id)
          .single();
        
        if (telegramError && telegramError.message.includes('telegram_chat_id')) {
          console.log('⚠️ telegram_chat_id column missing - need to add it');
          
          // Try to add column using raw SQL
          console.log('\n🔧 Attempting to add column via raw SQL...');
          
          // Since we can't execute raw SQL directly through the client,
          // we'll provide instructions for manual execution
          console.log('📝 Please execute this SQL in your Supabase SQL Editor:');
          console.log('');
          console.log('```sql');
          console.log('ALTER TABLE public.users ADD COLUMN telegram_chat_id text;');
          console.log('CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id ON public.users(telegram_chat_id);');
          console.log('```');
          
          console.log('\n💡 After running the SQL above, update this user with a test Telegram chat ID:');
          console.log('```sql');
          console.log(`UPDATE public.users SET telegram_chat_id = 'test_chat_${Date.now()}' WHERE email = 'trashbot7676@gmail.com';`);
          console.log('```');
          
        } else {
          console.log('✅ telegram_chat_id column exists');
          console.log('   Current value:', telegramData?.telegram_chat_id || 'Not set');
        }
        
      } catch (telegramErr) {
        console.log('⚠️ Could not check telegram_chat_id column:', telegramErr.message);
      }
      
    } catch (userError) {
      console.log('❌ Could not find test user:', userError.message);
    }
    
    // Provide alternative approaches
    console.log('\n🎯 Alternative Solutions:');
    console.log('1. Add column manually via Supabase Dashboard > SQL Editor');
    console.log('2. Use Supabase CLI: supabase db push');
    console.log('3. Create migration file and apply via supabase db push');
    console.log('\n4. For testing, you can also modify the test to use phone_number instead of telegram_chat_id');
    
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
  }
}

// Run the script
if (require.main === module) {
  addColumnDirectly().then(() => {
    console.log('\n🏁 Column addition process completed');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Process failed:', error);
    process.exit(1);
  });
}

module.exports = { addColumnDirectly };