# Package Selection Fallback API

## Why this endpoint exists
Your current frontend needs a way to submit a **selected package** when it is not yet using the fully dynamic/customizable `packages` flow.

This endpoint:
1. accepts the selected package JSON from the frontend (no customization schema),
2. saves it as a lead/inquiry in the database,
3. emails the logged-in user: _“You have chosen this package, one of our team member will talk to you regarding same”_,
4. (optionally, if configured) notifies the internal team/admin email configured in mail settings.

## Base URL
`/api/v1`

## Endpoint
### POST `/api/v1/packages/selection`

## Permissions
Authenticated user required (Bearer token).

## Request Body
The backend accepts the selected package JSON directly:

```json
{
  "category": "Small Homes",
  "name": "Starter Setup",
  "price": "12,999",
  "isPopular": false,
  "features": [
    "2x 2.4 MP HD Cameras",
    "500 GB Hard Disk Storage",
    "1 Four-Channel DVR",
    "Mobile App Remote Viewing (Android/iOS)",
    "Professional Installation Included",
    "1 Year Service Support"
  ]
}
```

The backend also supports an optional wrapper:

```json
{
  "selectedPackage": {
    "category": "Small Homes",
    "name": "Starter Setup",
    "price": "12,999",
    "isPopular": false,
    "features": ["..."]
  }
}
```

### Field validation rules
- `category`: required string
- `name`: required string
- `price`: required string or number
- `isPopular`: required boolean
- `features`: required array of strings

## Response
### 201 Created

```json
{
  "success": true,
  "data": {
    "id": "contact_submission_id",
    "createdAt": "2026-03-23T10:20:30.000Z"
  },
  "message": "Package selection received. Our team will contact you shortly."
}
```

## Error Responses
### 400 Bad Request
- Missing/invalid fields, invalid types, or user email missing.

```json
{
  "success": false,
  "error": "category is required"
}
```

### 401 Unauthorized
- Missing/invalid JWT.

```json
{
  "success": false,
  "error": "Authorization header missing or invalid"
}
```

## What happens after submission
- A new record is created in `ContactSubmission` (reused lead model).
- The user receives an email confirmation.
- The internal team email notification is sent only if `mailSettings.config.contactNotificationEmail`
  (or env fallback `CONTACT_NOTIFICATION_EMAIL` / `SMTP_USER`) is configured.

