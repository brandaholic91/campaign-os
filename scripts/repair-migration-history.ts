import { Client } from 'pg';

const DB_URL = 'postgresql://postgres:postgres@127.0.0.1:54332/postgres';

async function repairHistory() {
  const client = new Client({
    connectionString: DB_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const versionsToDelete = ['20251122', '20251123'];
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'supabase_migrations' 
        AND table_name = 'schema_migrations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Migration table not found. Nothing to repair.');
      return;
    }

    // Insert versions to mark them as applied
    const versionsToInsert = ['20251130', '20251201', '20251202'];
    
    for (const version of versionsToInsert) {
      await client.query(
        `INSERT INTO supabase_migrations.schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING`,
        [version]
      );
      console.log(`Marked version ${version} as applied.`);
    }

    // List all versions
    const result = await client.query(
      `SELECT version FROM supabase_migrations.schema_migrations ORDER BY version`
    );

    console.log('Current migration versions in DB:', result.rows.map(r => r.version));

  } catch (err) {
    console.error('Error repairing migration history:', err);
  } finally {
    await client.end();
  }
}

repairHistory();
