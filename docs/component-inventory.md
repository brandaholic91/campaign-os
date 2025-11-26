# Component Inventory

## UI Primitives (`components/ui/`)

These components are built using Radix UI primitives and styled with Tailwind CSS. They form the foundation of the design system.

-   **Button**: Standard interactive button.
-   **Input / Textarea**: Form input fields.
-   **Dialog**: Modal dialogs.
-   **Select**: Dropdown selection.
-   **Checkbox**: Boolean input.
-   **Label**: Form labels.
-   **Popover**: Floating content.
-   **ScrollArea**: Custom scrollable areas.
-   **Tabs**: Tabbed interface.
-   **Toast (Sonner)**: Notification system.

## Feature Components

### Campaigns (`components/campaigns/`)
Components specific to campaign management.
-   _CampaignList_: Displays list of campaigns.
-   _CampaignForm_: Form for creating/editing campaigns.
-   _CampaignDashboard_: Main view for a campaign.

### Messages (`components/messages/`)
Components for message strategy and management.
-   _MessageMatrix_: Grid view of messages by segment/topic.
-   _MessageCard_: Individual message display.

### Sprints (`components/sprints/`)
Components for sprint planning.
-   _SprintBoard_: Kanban or list view of sprints.
-   _SprintCalendar_: Calendar view of sprints.

## Providers (`components/providers/`)

-   **CopilotKitProvider**: Wraps the application to enable AI features via CopilotKit.
