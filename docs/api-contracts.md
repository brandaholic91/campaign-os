# API Contracts

The application uses Next.js Route Handlers to provide a RESTful API.

## Base URL
`/api`

## Authentication
Requests are authenticated via Supabase Auth cookies. The backend uses `@supabase/ssr` to validate sessions.

## Endpoints

### Campaigns

#### List Campaigns
`GET /api/campaigns`

Returns a list of all campaigns ordered by creation date.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Campaign Name",
    "status": "planning",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    ...
  }
]
```

#### Create Campaign
`POST /api/campaigns`

Creates a new campaign.

**Request Body:**
```json
{
  "name": "Campaign Name",
  "campaign_type": "product_launch",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "primary_goal_type": "conversion",
  "description": "Optional description"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Campaign Name",
  ...
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Missing required fields: name, campaign_type..."
}
```

### Content Slots

#### List Content Slots
`GET /api/content-slots`

Returns content slots, optionally filtered by sprint or campaign.

#### Create Content Slot
`POST /api/content-slots`

Creates a new content slot.

### Messages

#### List Messages
`GET /api/messages`

Returns messages matrix data.

## Error Handling

Errors are returned in a standard JSON format:

```json
{
  "error": "Human readable error message",
  "details": "Optional technical details"
}
```

Status codes:
-   `200`: Success
-   `201`: Created
-   `400`: Bad Request (Validation error)
-   `401`: Unauthorized
-   `404`: Not Found
-   `500`: Internal Server Error
