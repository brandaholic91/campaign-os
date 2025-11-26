import { Client } from 'pg';

const DB_URL = 'postgresql://postgres:postgres@127.0.0.1:54332/postgres';

async function removeDuplicateNarratives() {
  const client = new Client({ connectionString: DB_URL });

  try {
    await client.connect();
    
   // IDs of duplicate narratives with no connections
    const duplicateIds = [
      '37d97e06-617e-4df1-85dc-7e022674e8c6', // Élvezd a prémium ízeket! (duplicate)
      'ec29ba28-6a23-43f6-93d4-2437a9380bef', // Kapcsolódj a prémium sörözés élményéhez (duplicate)
      'abec3ea4-7b41-4ed2-b411-889e559534b7'  // A sörök története és hagyományai (duplicate)
    ];

    console.log('Deleting duplicate narratives...');
    
    for (const id of duplicateIds) {
      const result = await client.query(
        'DELETE FROM campaign_os.narratives WHERE id = $1',
        [id]
      );
      console.log(`Deleted narrative ${id}`);
    }

    console.log('\nDone! Checking remaining narratives...');
    
    const remaining = await client.query(
      'SELECT COUNT(*) as count FROM campaign_os.narratives'
    );
    
    console.log(`Remaining narratives: ${remaining.rows[0].count}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

removeDuplicateNarratives();
