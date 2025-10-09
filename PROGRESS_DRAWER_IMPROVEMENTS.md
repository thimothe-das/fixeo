# Progress Drawer Improvements - Implementation Summary

## Overview
Enhanced the ProgressDrawer component with improved styling, replaced pink colors with Fixeo brand colors (fixeo-blue), increased padding, and added status change date tracking with display.

## Changes Made

### 1. Database Schema Changes

#### New Table: `service_request_status_history`
- **File**: `lib/db/schema.ts`
- **Purpose**: Track when each status change occurred for service requests
- **Schema**:
  ```typescript
  {
    id: serial (primary key)
    serviceRequestId: integer (foreign key to service_requests)
    status: serviceRequestStatusEnum
    changedAt: timestamp (default now())
  }
  ```
- **Migration**: `lib/db/migrations/0013_hot_bulldozer.sql`

### 2. API Updates

#### Service Request Detail API (`app/api/service-requests/[id]/route.ts`)
- Added import for `serviceRequestStatusHistory`
- Queries status history for the service request
- Converts status history to a `Record<string, string>` map for easy lookup
- Returns `statusHistory` in the API response

#### Status Update Functions

**`lib/db/queries.ts`**
- `updateServiceRequestStatus()`: Now inserts status history entry after updating request status
- `updateBillingEstimateStatus()`: Inserts status history when estimate is accepted and request status changes to AWAITING_ASSIGNATION

**`lib/db/queries/admin.ts`**
- `createBillingEstimate()`: Inserts status history when creating estimate and updating request status to AWAITING_ESTIMATE_ACCEPTATION

**`app/api/service-requests/accept/route.ts`**
- Inserts status history entry when artisan accepts a request (status → IN_PROGRESS)

### 3. Component Updates

#### ProgressDrawer Component (`app/workspace/requests/@client/[id]/ProgressDrawer.tsx`)

**Props Interface Update**:
```typescript
interface ProgressDrawerProps {
  currentStatus: string;
  statusHistory?: Record<string, string>; // New prop
}
```

**Styling Improvements**:
- Replaced `#FF385C` (pink) with `fixeo-blue-600` for current step icon
- Replaced `bg-[#FF385C]/10 text-[#FF385C]` with `bg-fixeo-blue-100 text-fixeo-blue-700` for current step badge
- Increased SheetContent padding from default to `p-8`
- Increased title font size from `text-[22px]` to `text-[24px]`
- Increased spacing between timeline stages from `space-y-8` to `space-y-10`
- Increased overall container top margin from `mt-8` to `mt-10` and spacing from `space-y-6` to `space-y-8`

**Date Display**:
- Imported moment.js and French locale
- Added date display below stage descriptions for completed stages
- Format: "DD/MM/YYYY · relative time" (e.g., "15/10/2024 · il y a 2 jours")
- Uses `text-fixeo-gray-500` color for dates
- Only shows dates when status history is available for that stage

**French Locale**:
```typescript
React.useEffect(() => {
  moment.locale("fr");
}, []);
```

#### Request Detail Page (`app/workspace/requests/@client/[id]/page.tsx`)

**Type Definition Update**:
```typescript
type ServiceRequest = {
  // ... existing fields
  statusHistory?: Record<string, string>; // New field
}
```

**Component Usage**:
```typescript
<ProgressDrawer
  currentStatus={request.status}
  statusHistory={request.statusHistory} // New prop
/>
```

### 4. Data Backfill

#### Backfill Script (`lib/db/backfill-status-history.ts`)
- Created standalone script to populate status history for existing service requests
- Uses current status and createdAt timestamp as initial history entry
- Prevents duplicate entries by checking if history already exists
- Ran successfully: processed 1 new entry, skipped 9 existing entries

**Usage**:
```bash
npx tsx lib/db/backfill-status-history.ts
```

## Benefits

1. **Better User Experience**: Users can now see exactly when each status change occurred
2. **Brand Consistency**: Uses Fixeo brand colors (fixeo-blue) instead of generic pink
3. **Improved Readability**: Increased padding and spacing make the timeline more readable
4. **Localization**: Dates display in French format with relative time
5. **Historical Tracking**: Complete audit trail of status changes for each service request

## Files Modified

### Schema & Database
- `lib/db/schema.ts`
- `lib/db/migrations/0013_hot_bulldozer.sql` (generated)
- `lib/db/backfill-status-history.ts` (new)

### API & Queries
- `app/api/service-requests/[id]/route.ts`
- `app/api/service-requests/accept/route.ts`
- `lib/db/queries.ts`
- `lib/db/queries/admin.ts`

### Components
- `app/workspace/requests/@client/[id]/ProgressDrawer.tsx`
- `app/workspace/requests/@client/[id]/page.tsx`

## Testing Checklist

- [x] Database migration applied successfully
- [x] Status history table created with correct schema
- [x] API returns statusHistory in response
- [x] ProgressDrawer displays dates correctly
- [x] French locale works for relative dates
- [x] Fixeo brand colors applied correctly
- [x] Padding and spacing improvements visible
- [x] Backfill script runs without errors
- [x] No TypeScript linter errors in modified files

## Future Enhancements

1. Add status history to admin dashboard for better oversight
2. Export status history for reporting and analytics
3. Add status change reasons/notes to history entries
4. Display who changed the status (user/admin/artisan)
5. Create visual timeline chart using the status history data

