# Auth Context

## Overview
The Auth context handles all authentication, authorization, and user identity management.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-email` - Verify email address

### User Profile
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/change-password` - Change password

### Address Management
- `GET /api/v1/users/addresses` - List user addresses
- `POST /api/v1/users/addresses` - Create address
- `PUT /api/v1/users/addresses/:id` - Update address
- `DELETE /api/v1/users/addresses/:id` - Delete address
- `PUT /api/v1/users/addresses/:id/default` - Set default address

### Security
- `GET /api/v1/security/devices` - List trusted devices
- `DELETE /api/v1/security/devices/:id` - Remove device
- `GET /api/v1/security/sessions` - List active sessions
- `POST /api/v1/security/sessions/logout-all` - Logout all sessions
- `POST /api/v1/security/2fa/enable` - Enable 2FA
- `POST /api/v1/security/2fa/verify` - Verify 2FA
- `POST /api/v1/security/2fa/disable` - Disable 2FA

## Events Published

- `UserCreated` - When a new user is registered
- `UserUpdated` - When user profile is updated
- `UserVerified` - When user email is verified
- `PasswordChanged` - When user changes password
- `PasswordResetRequested` - When password reset is requested
- `LoginSucceeded` - When user successfully logs in
- `LoginFailed` - When login attempt fails
- `DeviceAdded` - When a new device is registered
- `SessionCreated` - When a new session is created
- `SessionTerminated` - When a session is terminated
- `2FAEnabled` - When 2FA is enabled for a user
- `2FADisabled` - When 2FA is disabled for a user

## Events Subscribed

None (Auth is a foundational context that other contexts depend on)

## Data Models

- `User` - User accounts
- `Address` - User addresses
- `Device` - Trusted devices
- `LoginAttempt` - Login attempt history
- `Session` - Active sessions
- `APIKey` - API keys for third-party integrations
- `AuditLog` - Security audit logs

## Dependencies

- Database: PostgreSQL (Prisma)
- Cache: Redis (sessions, rate limiting)
- JWT: Token generation and validation
- Bcrypt: Password hashing
- Speakeasy: 2FA TOTP generation

## Cross-Context Rules

- Other contexts can READ user data via API or events
- Other contexts CANNOT create/update/delete users directly
- User creation/updates must go through Auth context API
- User data changes are published as events for other contexts to consume


