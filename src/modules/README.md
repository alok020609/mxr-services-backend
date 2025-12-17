# Modular Architecture

This directory contains the modular architecture implementation with clear boundaries and event-based communication.

## Module Structure

```
src/modules/
├── auth/           # Authentication & authorization
├── catalog/        # Products, categories, search
├── orders/         # Order management
├── payments/       # Payment processing
├── inventory/      # Inventory management
├── admin/          # Admin features
├── integrations/   # Third-party integrations
└── notifications/  # Notification system
```

## Communication Rules

1. **Within Module**: Direct function calls and database access
2. **Cross-Module**: Event-based communication only
3. **No Direct DB Writes**: Cross-module updates must go through events

## Event Bus

All modules communicate via the centralized event bus (`src/services/eventService.js`).

## Example Usage

```javascript
// In orders module
const eventService = require('../../services/eventService');

// Publish event
eventService.publishDomainEvent('OrderPlaced', orderData, {
  aggregateType: 'Order',
  aggregateId: order.id,
});

// In inventory module
eventService.subscribe('OrderPlaced', async (event) => {
  // Handle order placed event
  await inventoryService.deductStock(event.payload.items);
});
```


