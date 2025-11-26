import { Client } from 'pg';

const DB_URL = 'postgresql://postgres:postgres@127.0.0.1:54332/postgres';

async function checkPolicies() {
  const client = new Client({ connectionString: DB_URL });

  try {
    await client.connect();
    
   // Check RLS policies
    const result = await client.query(`
      SELECT
        schemaname,
        tablename,
        policyname,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'campaign_os'
      AND tablename IN ('content_slots', 'content_drafts')
      ORDER BY tablename, policyname;
    `);

    console.log('RLS Policies:');
    result.rows.forEach(row => {
      console.log('\n---');
      console.log(`Table: ${row.tablename}`);
      console.log(`Policy: ${row.policyname}`);
      console.log(`Roles: ${row.roles}`);
      console.log(`Command: ${row.cmd}`);
      console.log(`USING: ${row.qual}`);
      console.log(`WITH CHECK: ${row.with_check}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkPolicies();
