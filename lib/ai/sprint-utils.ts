import { SprintFocusStage } from '@/lib/ai/schemas'

export interface SprintVolumeRecommendation {
  total_posts_per_week: number
  video_posts_per_week: number
  stories_per_week: number
}

interface VolumeCalculationParams {
  campaignType: string
  channels: string[]
  focusStage: string
}

/**
 * Calculates the recommended weekly post volume based on campaign parameters.
 */
export function calculateSprintVolume(params: VolumeCalculationParams): SprintVolumeRecommendation {
  const { campaignType, channels, focusStage } = params

  // 1. Base Volume by Campaign Type
  let baseVolume = 10 // Default base

  switch (campaignType) {
    case 'product_launch':
    case 'political_election':
      baseVolume = 14
      break
    case 'brand_awareness':
    case 'mobilization':
      baseVolume = 12
      break
    case 'ngo_issue':
    case 'political_issue':
      baseVolume = 8
      break
    default:
      baseVolume = 10
  }

  // 2. Channel Multipliers (Additions)
  let channelAdditions = 0
  let videoAdditions = 0
  let storyAdditions = 0

  const lowerChannels = channels.map(c => c.toLowerCase())

  if (lowerChannels.includes('tiktok')) {
    channelAdditions += 4
    videoAdditions += 3
  }
  if (lowerChannels.includes('twitter') || lowerChannels.includes('x')) {
    channelAdditions += 5
  }
  if (lowerChannels.includes('instagram')) {
    channelAdditions += 2
    storyAdditions += 4
  }
  if (lowerChannels.includes('facebook')) {
    channelAdditions += 2
    storyAdditions += 2
  }
  if (lowerChannels.includes('linkedin')) {
    channelAdditions += 1 // Quality over quantity
  }
  if (lowerChannels.includes('youtube')) {
    // Assuming Shorts are handled under video posts if frequent, but main channel usually low freq
    videoAdditions += 1
  }

  // 3. Sprint Focus Modifiers
  let focusMultiplier = 1.0

  // Map string to SprintFocusStage if needed, but we use string comparison for flexibility
  const stage = focusStage.toLowerCase()

  if (stage.includes('conversion') || stage.includes('mobilization')) {
    focusMultiplier = 1.2 // +20% intensity
  } else if (stage.includes('awareness')) {
    focusMultiplier = 1.0 // Standard
  } else if (stage.includes('consideration')) {
    focusMultiplier = 0.9 // -10% (deeper content, slightly less freq)
  } else if (stage.includes('engagement')) {
    focusMultiplier = 1.1 // +10%
  }

  // Calculate Totals
  const totalRaw = (baseVolume + channelAdditions) * focusMultiplier
  
  // Round to nearest integer
  const totalPosts = Math.max(5, Math.round(totalRaw)) // Minimum 5 posts/week

  // Calculate ratios for specific types
  // Video ratio: Base on channel additions + 20-40% of remaining
  const baseVideoRatio = 0.3
  const calculatedVideo = Math.min(totalPosts, Math.round(totalPosts * baseVideoRatio) + videoAdditions)
  
  // Stories are often separate from "feed posts" in some definitions, 
  // but here we treat total_posts_per_week as Feed/Main posts usually.
  // The prompt says "total_posts_per_week" and "stories_per_week" separately.
  // Let's keep stories separate as per prompt structure.
  
  const totalStories = Math.max(2, Math.round(storyAdditions * focusMultiplier))

  return {
    total_posts_per_week: totalPosts,
    video_posts_per_week: Math.max(1, calculatedVideo),
    stories_per_week: totalStories
  }
}
