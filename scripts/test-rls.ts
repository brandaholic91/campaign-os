import { createClient } from '@supabase/supabase-js';

// Use NEXT_PUBLIC keys to simulate browser client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testRLS() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  console.log('Testing RLS with anon key (simulating unauthenticated user)...');
  
  // Try to select from content_slots
  const { data, error } = await supabase
    .schema('campaign_os')
    .from('content_slots')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('RLS ERROR:', error);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
  } else {
    console.log('SUCCESS! Found', data?.length || 0, 'slots');
    if (data && data.length > 0) {
      console.log('First slot:', data[0]);
    }
  }
}

testRLS();
