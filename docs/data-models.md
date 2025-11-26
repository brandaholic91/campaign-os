# Data Models

The database is built on PostgreSQL and managed via Supabase.

## Core Tables

### `campaigns`
The central entity representing a marketing campaign.
-   `id`: UUID (PK)
-   `name`: Text
-   `campaign_type`: Enum (`political_election`, `product_launch`, etc.)
-   `status`: Enum (`planning`, `running`, `closed`)
-   `start_date`, `end_date`: Date
-   `primary_goal_type`: Enum

### `goals`
Specific objectives for a campaign.
-   `id`: UUID (PK)
-   `campaign_id`: FK to `campaigns`
-   `title`: Text
-   `priority`: Integer

### `segments`
Target audiences.
-   `id`: UUID (PK)
-   `campaign_id`: FK to `campaigns`
-   `demographics`: JSONB
-   `psychographics`: JSONB

### `topics`
Key themes or issues.
-   `id`: UUID (PK)
-   `campaign_id`: FK to `campaigns`
-   `name`: Text

### `messages`
Core messaging matrix.
-   `id`: UUID (PK)
-   `segment_id`: FK to `segments`
-   `topic_id`: FK to `topics`
-   `headline`: Text
-   `body`: Text

## Execution Tables

### `sprints`
Time-boxed execution periods.
-   `id`: UUID (PK)
-   `campaign_id`: FK to `campaigns`
-   `start_date`, `end_date`: Date
-   `focus_goal`: Text

### `content_slots`
Planned content pieces within a sprint.
-   `id`: UUID (PK)
-   `sprint_id`: FK to `sprints`
-   `campaign_id`: FK to `campaigns`
-   `funnel_stage`: Enum (awareness, etc.)
-   `angle_type`: Enum (story, proof, etc.)
-   `status`: Enum (planned, scheduled, cancelled)
-   `related_goal_ids`: JSONB (Array of goal IDs)

### `content_drafts`
Concrete content generated for a slot.
-   `id`: UUID (PK)
-   `slot_id`: FK to `content_slots`
-   `status`: Enum (draft, approved, etc.)
-   `hook`: Text
-   `body`: Text
-   `visual_idea`: Text
-   `created_by`: Enum (ai, human)

## Enums

-   **campaign_type**: `political_election`, `political_issue`, `brand_awareness`, `product_launch`, `promo`, `ngo_issue`
-   **goal_type**: `awareness`, `engagement`, `list_building`, `conversion`, `mobilization`
-   **funnel_stage**: `awareness`, `engagement`, `consideration`, `conversion`, `mobilization`
-   **angle_type**: `story`, `proof`, `how_to`, `comparison`, `behind_the_scenes`, `testimonial`, `other`
