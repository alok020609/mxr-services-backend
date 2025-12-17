# Testing Strategy

This directory contains comprehensive tests for the e-commerce backend following the test pyramid approach.

## Test Pyramid

```
        /\
       /  \     10% E2E Tests
      /____\
     /      \   30% Integration Tests
    /________\
   /          \  60% Unit Tests
  /____________\
```

### Distribution
- **60% Unit Tests** - Fast, isolated, test individual functions/classes
- **30% Integration Tests** - Test component interactions, database, external services
- **10% E2E Tests** - Test complete user flows end-to-end

## Test Structure

```
tests/
├── unit/              # Unit tests (60%)
│   ├── services/      # Service layer tests
│   ├── controllers/   # Controller tests
│   ├── middleware/   # Middleware tests
│   └── utils/         # Utility tests
├── integration/        # Integration tests (30%)
│   ├── api/           # API endpoint tests
│   ├── database/      # Database integration tests
│   ├── payments/      # Payment gateway tests
│   └── events/        # Event system tests
├── e2e/               # End-to-end tests (10%)
│   ├── auth/          # Authentication flows
│   ├── orders/         # Order placement flows
│   └── payments/       # Payment flows
├── contracts/         # Contract tests
│   └── gateways/       # Payment gateway contracts
├── load/              # Load tests (k6/Artillery)
│   └── scenarios/      # Load test scenarios
├── chaos/             # Chaos engineering tests
│   └── scenarios/      # Chaos scenarios
├── fixtures/          # Test data fixtures
├── helpers/           # Test helpers and utilities
├── mocks/             # Mock objects
└── setup.js           # Test setup and teardown
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### E2E Tests Only
```bash
npm run test:e2e
```

### With Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

### Specific Test File
```bash
npm test -- authService.test.js
```

## Test Types

### 1. Unit Tests

Test individual functions, classes, or modules in isolation.

**Example:**
```javascript
// tests/unit/services/authService.test.js
describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const hashed = await authService.hashPassword('password123');
      expect(hashed).not.toBe('password123');
      expect(hashed.length).toBeGreaterThan(50);
    });
  });
});
```

### 2. Integration Tests

Test interactions between components, database, and external services.

**Example:**
```javascript
// tests/integration/api/auth.test.js
describe('POST /api/v1/auth/register', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('test@example.com');
  });
});
```

### 3. E2E Tests

Test complete user flows from start to finish.

**Example:**
```javascript
// tests/e2e/orders/placeOrder.test.js
describe('Order Placement Flow', () => {
  it('should complete full order placement flow', async () => {
    // 1. Register user
    // 2. Login
    // 3. Add products to cart
    // 4. Create order
    // 5. Process payment
    // 6. Verify order status
  });
});
```

### 4. Contract Tests

Test contracts with external services (payment gateways).

**Example:**
```javascript
// tests/contracts/gateways/stripe.test.js
describe('Stripe Gateway Contract', () => {
  it('should match Stripe API contract', async () => {
    // Test against Stripe sandbox
  });
});
```

### 5. Load Tests

Test system performance under load.

**Example:**
```javascript
// tests/load/scenarios/apiLoad.test.js
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const response = http.get('https://api.example.com/products');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### 6. Chaos Tests

Test system resilience to failures.

**Example:**
```javascript
// tests/chaos/scenarios/databaseFailure.test.js
describe('Database Failure Scenario', () => {
  it('should handle database connection loss gracefully', async () => {
    // Simulate database failure
    // Verify system handles it correctly
  });
});
```

## Test Data Management

### Fixtures
- Use fixtures for consistent test data
- Located in `tests/fixtures/`
- Reusable across test files

### Factories
- Use factories to generate test data
- Located in `tests/helpers/factories.js`
- Support for creating users, products, orders, etc.

### Database Seeding
- Use test database for integration/E2E tests
- Reset database before each test suite
- Use transactions for test isolation

## Mocking Strategy

### External Services
- Mock payment gateways in unit tests
- Use sandbox environments in integration tests
- Use real services in E2E tests (with test accounts)

### Database
- Use in-memory database for unit tests
- Use test database for integration tests
- Use transactions for isolation

### Event System
- Mock event bus in unit tests
- Use real event bus in integration tests
- Verify events are published correctly

## Coverage Goals

- **Overall Coverage**: > 80%
- **Critical Paths**: > 90%
- **Payment Processing**: 100%
- **Order Management**: > 90%
- **Authentication**: > 90%

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Nightly builds

## Test Best Practices

1. **Isolation**: Each test should be independent
2. **Fast**: Unit tests should run in milliseconds
3. **Deterministic**: Tests should produce consistent results
4. **Clear**: Test names should describe what they test
5. **Maintainable**: Tests should be easy to update
6. **Coverage**: Aim for high coverage of critical paths

## Payment Gateway Testing

### Sandbox Environments
- Stripe: Use test API keys
- Razorpay: Use test mode
- PayPal: Use sandbox accounts

### Webhook Testing
- Use webhook replay tools
- Test idempotency
- Test error handling

## Performance Testing

### Load Testing
- Use k6 or Artillery
- Test API endpoints under load
- Measure response times
- Identify bottlenecks

### Stress Testing
- Test system limits
- Find breaking points
- Verify graceful degradation

## Chaos Engineering

### Failure Scenarios
- Database connection loss
- Redis unavailability
- Payment gateway failures
- Network partitions

### Recovery Testing
- Verify automatic recovery
- Test fallback mechanisms
- Validate data consistency


