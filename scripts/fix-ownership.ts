import { Client } from 'pg';

const DB_URL = 'postgresql://postgres:postgres@127.0.0.1:54332/postgres';

async function fixOwnership() {
  const client = new Client({
    connectionString: DB_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check all tables
    const result = await client.query(`
      SELECT schemaname, tablename, tableowner 
      FROM pg_tables 
      WHERE schemaname IN ('campaign_os', 'public')
      ORDER BY schemaname, tablename;
    `);
    
    console.log('All tables:', result.rows);

    // Try to drop content_drafts to clean up
    try {
      await client.query('DROP TABLE IF EXISTS campaign_os.content_drafts CASCADE');
      console.log('Dropped campaign_os.content_drafts');
    } catch (e) {
      console.error('Failed to drop campaign_os.content_drafts:', e);
    }

    try {
      await client.query('DROP TABLE IF EXISTS public.content_drafts CASCADE');
      console.log('Dropped public.content_drafts');
    } catch (e) {
      console.error('Failed to drop public.content_drafts:', e);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixOwnership();
