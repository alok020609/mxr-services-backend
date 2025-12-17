# Payments Context

## Overview
The Payments context handles all payment processing, gateway integration, refunds, and wallet operations.

## API Endpoints

### Payment Processing
- `POST /api/v1/payments/create-intent` - Create payment intent
- `POST /api/v1/payments/confirm` - Confirm payment
- `GET /api/v1/payments/:orderId` - Get payment status
- `POST /api/v1/payments/:id/refund` - Process refund
- `GET /api/v1/payments/:id/transactions` - Get payment transactions

### Payment Methods
- `GET /api/v1/payment-methods` - List saved payment methods
- `POST /api/v1/payment-methods` - Add payment method
- `DELETE /api/v1/payment-methods/:id` - Remove payment method
- `PUT /api/v1/payment-methods/:id/default` - Set default payment method

### Wallet
- `GET /api/v1/wallet` - Get wallet balance
- `POST /api/v1/wallet/deposit` - Deposit to wallet
- `POST /api/v1/wallet/withdraw` - Withdraw from wallet
- `GET /api/v1/wallet/transactions` - Get wallet transactions

### Store Credit
- `GET /api/v1/store-credit` - Get store credit balance
- `GET /api/v1/store-credit/transactions` - Get store credit transactions

### Webhooks
- `POST /api/v1/webhooks/payments/stripe` - Stripe webhook
- `POST /api/v1/webhooks/payments/razorpay` - Razorpay webhook
- `POST /api/v1/webhooks/payments/paypal` - PayPal webhook
- `POST /api/v1/webhooks/payments/payu` - PayU webhook

## Events Published

- `PaymentInitiated` - When payment is initiated
- `PaymentConfirmed` - When payment is confirmed
- `PaymentFailed` - When payment fails
- `PaymentRefunded` - When payment is refunded
- `PaymentCancelled` - When payment is cancelled
- `PaymentMethodAdded` - When a payment method is added
- `PaymentMethodRemoved` - When a payment method is removed
- `WalletDeposited` - When wallet is deposited
- `WalletWithdrawn` - When wallet is withdrawn

## Events Subscribed

- `OrderPlaced` (from Orders) - Initiate payment for order
- `OrderCancelled` (from Orders) - Cancel payment or process refund
- `OrderReturnApproved` (from Orders) - Process refund for return

## Data Models

- `Payment` - Payment records
- `PaymentGateway` - Payment gateway configurations
- `PaymentTransaction` - Payment transaction history
- `Wallet` - User wallets
- `WalletTransaction` - Wallet transactions
- `StoreCredit` - Store credit records
- `StoreCreditTransaction` - Store credit transactions
- `PaymentPlan` - Payment plans (installments)
- `OrderPaymentPlan` - Order payment plans

## Dependencies

- Database: PostgreSQL (Prisma)
- Payment Gateways: Stripe, Razorpay, PayPal, PayU, UPI
- Cache: Redis (idempotency keys, rate limiting)
- Event Bus: For cross-context communication

## Cross-Context Rules

- Only Payments context can create/update payment transactions
- Must coordinate with Orders context for order payment status
- Cannot directly modify order data (only via events)
- Payment webhooks must be idempotent
- Payment processing is asynchronous and event-driven

## Payment Gateway Abstraction

The Payments context uses a gateway abstraction layer:
- `IPaymentGateway` - Interface for payment gateways
- `PaymentGatewayFactory` - Factory to create gateway instances
- Gateway implementations: Stripe, Razorpay, PayPal, PayU, UPI

Each gateway implements:
- `createPaymentIntent()` - Create payment intent
- `confirmPayment()` - Confirm payment
- `refundPayment()` - Process refund
- `handleWebhook()` - Handle gateway webhooks


