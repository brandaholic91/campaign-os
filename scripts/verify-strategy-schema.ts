
import { CampaignStructureSchema } from '../lib/ai/schemas';
import { z } from 'zod';

const mockStrategy: z.infer<typeof CampaignStructureSchema> = {
  goals: [
    {
      title: "Goal 1",
      description: "Description",
      priority: 1,
      funnel_stage: "awareness",
      kpi_hint: "Reach > 10k"
    }
  ],
  segments: [
    {
      name: "Segment 1",
      short_label: "Seg 1",
      description: "Desc",
      demographic_profile: {
        age_range: "20-30",
        location_type: "Urban"
      },
      psychographic_profile: {
        values: ["Value 1"],
        attitudes_to_campaign_topic: ["Positive"],
        motivations: ["Motivation 1"],
        pain_points: ["Pain 1"]
      },
      media_habits: {
        primary_channels: ["FB"],
        secondary_channels: ["IG"],
        notes: "Notes"
      },
      funnel_stage_focus: "awareness",
      example_persona: {
        name: "Persona 1",
        one_sentence_story: "Story"
      },
      priority: "primary"
    }
  ],
  topics: [
    {
      name: "Topic 1",
      short_label: "T1",
      description: "Desc",
      topic_type: "benefit",
      related_goal_types: ["awareness"],
      core_narrative: "Narrative",
      content_angles: ["Angle 1"],
      recommended_channels: ["FB"],
      risk_notes: ["Risk"],
      priority: "primary",
      related_goal_stages: ["awareness", "consideration"],
      recommended_content_types: ["short_video", "story"]
    }
  ],
  narratives: [
    {
      title: "Narrative 1",
      description: "Desc",
      priority: 1,
      goal_indices: [0],
      topic_indices: [0],
      suggested_phase: "early"
    }
  ],
  segment_topic_matrix: [
    {
      segment_index: 0,
      topic_index: 0,
      importance: "high",
      role: "core_message",
      summary: "Summary"
    }
  ]
};

try {
  const result = CampaignStructureSchema.parse(mockStrategy);
  console.log("✅ Schema validation successful!");
  console.log("Validated structure with new fields:");
  console.log("- goals[0].funnel_stage:", result.goals[0].funnel_stage);
  console.log("- goals[0].kpi_hint:", result.goals[0].kpi_hint);
  console.log("- topics[0].related_goal_stages:", result.topics?.[0]?.related_goal_stages);
  console.log("- topics[0].recommended_content_types:", result.topics?.[0]?.recommended_content_types);
  console.log("- narratives[0].goal_indices:", result.narratives?.[0]?.goal_indices);
  console.log("- narratives[0].topic_indices:", result.narratives?.[0]?.topic_indices);
  console.log("- narratives[0].suggested_phase:", result.narratives?.[0]?.suggested_phase);
} catch (error) {
  console.error("❌ Schema validation failed:", error);
  process.exit(1);
}
