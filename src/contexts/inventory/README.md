# Inventory Context

## Overview
The Inventory context manages stock levels, warehouse operations, and inventory movements.

## API Endpoints

### Inventory Management
- `GET /api/v1/inventory` - List inventory (with filters)
- `GET /api/v1/inventory/:variantId` - Get inventory for variant
- `PUT /api/v1/inventory/:variantId` - Update inventory (admin)
- `POST /api/v1/inventory/:variantId/adjust` - Adjust inventory (admin)
- `GET /api/v1/inventory/:variantId/movements` - Get inventory movements
- `GET /api/v1/inventory/low-stock` - Get low stock alerts

### Warehouse Management
- `GET /api/v1/warehouses` - List warehouses
- `GET /api/v1/warehouses/:id` - Get warehouse details
- `POST /api/v1/warehouses` - Create warehouse (admin)
- `PUT /api/v1/warehouses/:id` - Update warehouse (admin)
- `GET /api/v1/warehouses/:id/stock` - Get warehouse stock
- `POST /api/v1/warehouses/:id/transfer` - Transfer stock between warehouses

### Advanced Inventory
- `GET /api/v1/advanced-inventory/forecast` - Demand forecasting
- `GET /api/v1/advanced-inventory/reorder-points` - Reorder point calculations
- `GET /api/v1/advanced-inventory/aging` - Inventory aging report
- `POST /api/v1/advanced-inventory/cycle-count` - Cycle counting

## Events Published

- `InventoryReserved` - When inventory is reserved for an order
- `InventoryDeducted` - When inventory is deducted (order confirmed)
- `InventoryReverted` - When inventory is reverted (order cancelled)
- `LowStockAlert` - When stock falls below threshold
- `OutOfStock` - When product goes out of stock
- `StockUpdated` - When stock is updated
- `StockTransferred` - When stock is transferred between warehouses

## Events Subscribed

- `OrderPlaced` (from Orders) - Reserve inventory for order
- `OrderConfirmed` (from Orders) - Deduct inventory
- `OrderCancelled` (from Orders) - Revert inventory
- `ProductCreated` (from Catalog) - Initialize inventory for new product

## Data Models

- `Inventory` - Inventory records per variant
- `InventoryMovement` - Inventory movement history
- `Warehouse` - Warehouse information
- `WarehouseStock` - Stock per warehouse

## Dependencies

- Database: PostgreSQL (Prisma)
- Distributed Locks: Redis (for concurrent stock updates)
- Event Bus: For cross-context communication

## Cross-Context Rules

- Only Inventory context can modify stock levels
- Must use distributed locks for concurrent stock updates
- Orders context can READ inventory but not modify it
- Catalog context can READ inventory for display purposes
- Stock updates are published as events for other contexts

## Concurrency Control

- Uses Redis distributed locks for inventory updates
- Optimistic locking with version fields
- Idempotent inventory operations
- Retry logic for failed operations

## Inventory Operations

1. **Reserve**: Reserve stock for an order (temporary hold)
2. **Deduct**: Deduct stock when order is confirmed
3. **Revert**: Revert stock when order is cancelled
4. **Adjust**: Manual inventory adjustment (admin)
5. **Transfer**: Transfer stock between warehouses


