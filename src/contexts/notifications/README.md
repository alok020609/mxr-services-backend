# Notifications Context

## Overview
The Notifications context handles all notification delivery including email, SMS, push, and in-app notifications.

## API Endpoints

### Notifications
- `GET /api/v1/notifications` - List user notifications
- `GET /api/v1/notifications/:id` - Get notification details
- `PUT /api/v1/notifications/:id/read` - Mark notification as read
- `PUT /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/:id` - Delete notification

### Notification Preferences
- `GET /api/v1/notification-preferences` - Get user preferences
- `PUT /api/v1/notification-preferences` - Update preferences

### Email Templates
- `GET /api/v1/email-templates` - List email templates (admin)
- `GET /api/v1/email-templates/:id` - Get template (admin)
- `POST /api/v1/email-templates` - Create template (admin)
- `PUT /api/v1/email-templates/:id` - Update template (admin)
- `DELETE /api/v1/email-templates/:id` - Delete template (admin)

## Events Published

- `NotificationSent` - When a notification is sent
- `NotificationFailed` - When notification delivery fails
- `EmailDelivered` - When email is delivered
- `EmailBounced` - When email bounces
- `SMSDelivered` - When SMS is delivered
- `PushNotificationSent` - When push notification is sent

## Events Subscribed

- `UserCreated` (from Auth) - Send welcome email
- `OrderPlaced` (from Orders) - Send order confirmation
- `OrderShipped` (from Orders) - Send shipping notification
- `OrderDelivered` (from Orders) - Send delivery confirmation
- `OrderCancelled` (from Orders) - Send cancellation email
- `PaymentConfirmed` (from Payments) - Send payment confirmation
- `PaymentFailed` (from Payments) - Send payment failure notification
- `ProductCreated` (from Catalog) - Send new product notifications (if subscribed)
- `LowStockAlert` (from Inventory) - Send low stock alerts to admins
- `ReviewCreated` (from Catalog) - Send review notification to product owner

## Data Models

- `Notification` - In-app notifications
- `NotificationTemplate` - Notification templates
- `EmailTemplate` - Email templates
- `StockNotification` - Stock notification subscriptions

## Dependencies

- Database: PostgreSQL (Prisma)
- Email Service: Nodemailer with SendGrid/Mailchimp
- SMS Service: Twilio
- Push Notifications: Firebase Cloud Messaging / Apple Push Notification Service
- Queue: Bull/Redis (for async notification delivery)
- Event Bus: For cross-context communication

## Cross-Context Rules

- Only Notifications context can send notifications
- Other contexts publish events, Notifications context handles delivery
- No direct database writes to notification tables from other contexts
- Notification delivery is eventually consistent
- Notification preferences are managed by this context

## Notification Types

1. **Email**: Order confirmations, shipping updates, password resets
2. **SMS**: Order updates, OTP codes, important alerts
3. **Push**: Mobile app notifications
4. **In-App**: In-app notification center

## Delivery Strategy

- Async delivery via job queue
- Retry logic for failed deliveries
- Dead-letter queue for persistent failures
- Delivery tracking and status updates
- User preference enforcement


