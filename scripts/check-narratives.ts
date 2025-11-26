import { Client } from 'pg';

const DB_URL = 'postgresql://postgres:postgres@127.0.0.1:54332/postgres';

async function checkNarratives() {
  const client = new Client({ connectionString: DB_URL });

  try {
    await client.connect();
    
    // Get all narratives with their goals and topics
    const result = await client.query(`
      SELECT 
        n.id,
        n.title,
        n.campaign_id,
        n.priority,
        n.suggested_phase,
        array_agg(DISTINCT ng.goal_id) FILTER (WHERE ng.goal_id IS NOT NULL) as goal_ids,
        array_agg(DISTINCT nt.topic_id) FILTER (WHERE nt.topic_id IS NOT NULL) as topic_ids
      FROM campaign_os.narratives n
      LEFT JOIN campaign_os.narrative_goals ng ON n.id = ng.narrative_id
      LEFT JOIN campaign_os.narrative_topics nt ON n.id = nt.narrative_id
      GROUP BY n.id, n.title, n.campaign_id, n.priority, n.suggested_phase
      ORDER BY n.priority, n.created_at;
    `);

    console.log('Total narratives:', result.rowCount);
    console.log('\nNarratives:');
    result.rows.forEach((row, idx) => {
      console.log(`\n${idx + 1}. ${row.title}`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Priority: ${row.priority}`);
      console.log(`   Phase: ${row.suggested_phase}`);
      console.log(`   Goals: ${row.goal_ids?.length || 0}`);
      console.log(`   Topics: ${row.topic_ids?.length || 0}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkNarratives();
