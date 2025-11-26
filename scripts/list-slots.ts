import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listSlots() {
  console.log('Connecting to Supabase...');
  
  // List Sprints first
  console.log('\n--- Sprints (First 5) ---');
  const { data: sprints, error: sprintError } = await supabase
    .schema('campaign_os')
    .from('sprints')
    .select('id, name, campaign_id')
    .limit(5);

  if (sprintError) {
    console.error('Error fetching sprints:', sprintError);
  } else {
    console.log(JSON.stringify(sprints, null, 2));
  }

  // List Content Slots
  console.log('\n--- Content Slots for Sprint d25a0426-d446-488d-9845-9cd425b6bcd7 ---');
  const { data: slots, error: slotError } = await supabase
    .schema('campaign_os')
    .from('content_slots')
    .select('id, sprint_id, date, channel, slot_index')
    .eq('sprint_id', 'd25a0426-d446-488d-9845-9cd425b6bcd7');

  if (slotError) {
    console.error('Error fetching slots:', slotError);
  } else {
    console.log(JSON.stringify(slots, null, 2));
    
    // Check content_drafts table
    console.log('\n--- Content Drafts (First 5) ---');
    const { data: drafts, error: draftError } = await supabase
      .schema('campaign_os')
      .from('content_drafts')
      .select('*')
      .limit(5);

    if (draftError) {
      console.error('Error fetching drafts:', draftError);
    } else {
      if (drafts && drafts.length === 0) {
        console.log('No content drafts found.');
      } else {
        console.log(JSON.stringify(drafts, null, 2));
      }
    }

    // Check relationship
    console.log('\n--- Slot with Drafts (Relationship Check) ---');
    if (slots && slots.length > 0) {
      const slotId = slots[0].id;
      const { data: slotWithDrafts, error: relError } = await supabase
        .schema('campaign_os')
        .from('content_slots')
        .select('*, content_drafts(*)')
        .eq('id', slotId)
        .single();
      
      if (relError) {
        console.error('Error fetching slot with drafts:', relError);
      } else {
        console.log('Relationship query successful');
        console.log(JSON.stringify(slotWithDrafts, null, 2));
      }
    }
  }
}

listSlots();
