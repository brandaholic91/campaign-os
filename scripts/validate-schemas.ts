
import { z } from 'zod';
import { 
  GoalSchema, 
  TopicSchema, 
  NarrativeSchema, 
  SegmentSchema 
} from '../lib/ai/schemas';

console.log('Validating schemas...');

try {
  // Test GoalSchema with new fields
  GoalSchema.parse({
    title: 'Test Goal',
    priority: 1,
    funnel_stage: 'awareness',
    kpi_hint: 'Reach 10k'
  });
  console.log('✅ GoalSchema valid');

  // Test TopicSchema with new fields
  TopicSchema.parse({
    name: 'Test Topic',
    related_goal_stages: ['awareness', 'conversion'],
    recommended_content_types: ['video', 'blog']
  });
  console.log('✅ TopicSchema valid');

  // Test NarrativeSchema with new fields
  NarrativeSchema.parse({
    title: 'Test Narrative',
    description: 'Desc',
    suggested_phase: 'early',
    primary_goal_ids: ['123e4567-e89b-12d3-a456-426614174000'],
    primary_topic_ids: ['123e4567-e89b-12d3-a456-426614174000']
  });
  console.log('✅ NarrativeSchema valid');

  console.log('All schemas validated successfully!');
} catch (error) {
  console.error('❌ Schema validation failed:', error);
  process.exit(1);
}
