# TestSprite-Style Testing Guide for Money Project

This guide explains how to run comprehensive tests for your Money project using a TestSprite-inspired testing framework.

## 🧪 Testing Framework Overview

We've set up a comprehensive testing environment that covers both frontend and backend components:

### Frontend Testing (React + TypeScript)
- **Framework**: Vitest + React Testing Library
- **Coverage**: Component testing, user interactions, form validation
- **Location**: `src/components/__tests__/` and `src/pages/__tests__/`

### Backend Testing (Node.js + Express)
- **Framework**: Jest + Supertest
- **Coverage**: API endpoints, authentication, database operations
- **Location**: `backend/test/`

## 🚀 Quick Start

### Run All Tests
```bash
# From project root
./run-tests.sh
```

### Run Frontend Tests Only
```bash
# From project root
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
npm run test:ui       # UI mode
```

### Run Backend Tests Only
```bash
# From backend directory
cd backend
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

## 📋 Test Categories

### Frontend Tests
- **Component Tests**: Test individual React components
- **Integration Tests**: Test component interactions
- **User Interaction Tests**: Test user events and form submissions
- **Authentication Tests**: Test protected routes and auth flows

### Backend Tests
- **API Tests**: Test all REST endpoints
- **Authentication Tests**: Test JWT token validation
- **Database Tests**: Test CRUD operations
- **Validation Tests**: Test input validation and error handling

## 🔧 Configuration Files

### Frontend Configuration
- `vitest.config.ts` - Vitest configuration
- `src/test/setup.ts` - Test setup and global configurations

### Backend Configuration
- `backend/jest.config.js` - Jest configuration
- `backend/test/setup.js` - Test database setup and cleanup

## 📊 Test Reports

After running tests, you'll find detailed reports in the `test-results/` directory:

- `frontend-tests.txt` - Frontend test output
- `backend-tests.txt` - Backend test output
- `test-summary.md` - Comprehensive test summary

## 🎯 Sample Test Examples

### Frontend Component Test
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Login from '../Login'

describe('Login Page', () => {
  it('renders login form', () => {
    render(<Login />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })
})
```

### Backend API Test
```javascript
const request = require('supertest')
const app = require('../server')

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })
      .expect(201)

    expect(response.body).toHaveProperty('token')
  })
})
```

## 🔍 Adding New Tests

### Frontend Tests
1. Create test files in `src/components/__tests__/` or `src/pages/__tests__/`
2. Use `.test.tsx` or `.test.ts` extension
3. Import testing utilities from `@testing-library/react`

### Backend Tests
1. Create test files in `backend/test/`
2. Use `.test.js` extension
3. Import `supertest` for API testing

## 🐛 Debugging Tests

### Frontend Debugging
```bash
# Run tests in UI mode for better debugging
npm run test:ui

# Run specific test file
npm run test src/components/__tests__/Login.test.tsx
```

### Backend Debugging
```bash
# Run tests in watch mode
cd backend && npm run test:watch

# Run specific test file
cd backend && npm test auth.test.js
```

## 📈 Coverage Reports

### Frontend Coverage
```bash
npm run test:coverage
# Coverage report will be in coverage/ directory
```

### Backend Coverage
```bash
cd backend && npm run test:coverage
# Coverage report will be in backend/coverage/ directory
```

## 🔄 Continuous Integration

To set up CI/CD with these tests:

1. Add test scripts to your CI pipeline
2. Run `./run-tests.sh` in your CI environment
3. Check test results in `test-results/` directory
4. Fail the build if tests fail

## 🎨 TestSprite-Style Features

This testing setup provides TestSprite-like capabilities:

- **Automated Test Generation**: Sample tests demonstrate patterns
- **Comprehensive Coverage**: Both frontend and backend testing
- **Detailed Reporting**: HTML and markdown reports
- **Easy Integration**: Simple commands to run all tests
- **Extensible Framework**: Easy to add new test categories

## 🚨 Troubleshooting

### Common Issues

1. **Tests not running**: Make sure dependencies are installed
2. **Database connection errors**: Check MongoDB connection in backend tests
3. **Module not found errors**: Check import paths and file extensions
4. **Authentication errors**: Ensure test user setup is correct

### Getting Help

- Check test output files in `test-results/`
- Review configuration files
- Ensure all dependencies are installed
- Check that your application is properly set up

## 🎉 Next Steps

1. **Run the tests**: `./run-tests.sh`
2. **Review results**: Check `test-results/test-summary.md`
3. **Add more tests**: Follow the patterns in existing test files
4. **Set up CI/CD**: Integrate with your deployment pipeline
5. **Monitor coverage**: Aim for high test coverage

Happy testing! 🧪✨
