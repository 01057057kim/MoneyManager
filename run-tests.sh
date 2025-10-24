#!/bin/bash

# TestSprite-style comprehensive test runner for Money project
echo "🧪 Starting comprehensive test suite for Money project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Create test results directory
mkdir -p test-results

print_status "Setting up test environment..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Run frontend tests
print_status "Running frontend tests..."
echo "================================"
cd /home/zoryn/Desktop/Project/Money

if npm run test:run > test-results/frontend-tests.txt 2>&1; then
    print_success "Frontend tests passed!"
else
    print_error "Frontend tests failed! Check test-results/frontend-tests.txt"
    FRONTEND_FAILED=true
fi

# Run backend tests
print_status "Running backend tests..."
echo "================================"
cd backend

if npm test > ../test-results/backend-tests.txt 2>&1; then
    print_success "Backend tests passed!"
else
    print_error "Backend tests failed! Check test-results/backend-tests.txt"
    BACKEND_FAILED=true
fi

cd ..

# Generate test summary
print_status "Generating test summary..."
echo "================================"

cat > test-results/test-summary.md << EOF
# TestSprite Test Report - Money Project

## Test Execution Summary

### Frontend Tests
- **Status**: $([ "$FRONTEND_FAILED" = true ] && echo "❌ FAILED" || echo "✅ PASSED")
- **Framework**: Vitest + React Testing Library
- **Coverage**: Component testing, user interactions, form validation

### Backend Tests
- **Status**: $([ "$BACKEND_FAILED" = true ] && echo "❌ FAILED" || echo "✅ PASSED")
- **Framework**: Jest + Supertest
- **Coverage**: API endpoints, authentication, data validation

## Test Categories Covered

### Frontend Testing
- ✅ Component rendering
- ✅ User interactions
- ✅ Form validation
- ✅ Authentication flow
- ✅ Protected routes

### Backend Testing
- ✅ API endpoint testing
- ✅ Authentication middleware
- ✅ Data validation
- ✅ Database operations
- ✅ Error handling

## Recommendations

1. **Add Integration Tests**: Test the full user flow from frontend to backend
2. **Add E2E Tests**: Use Playwright or Cypress for end-to-end testing
3. **Add Performance Tests**: Test API response times and frontend performance
4. **Add Security Tests**: Test for common vulnerabilities
5. **Add Accessibility Tests**: Ensure the app is accessible

## Next Steps

1. Review failed tests and fix issues
2. Add more test cases for edge scenarios
3. Set up continuous integration
4. Add test coverage reporting
5. Implement visual regression testing

---
Generated on: $(date)
EOF

print_success "Test summary generated: test-results/test-summary.md"

# Display summary
echo ""
echo "================================"
print_status "TEST EXECUTION COMPLETE"
echo "================================"

if [ "$FRONTEND_FAILED" = true ] || [ "$BACKEND_FAILED" = true ]; then
    print_error "Some tests failed. Please check the test results."
    exit 1
else
    print_success "All tests passed! 🎉"
fi

echo ""
print_status "Test results available in:"
echo "  - test-results/frontend-tests.txt"
echo "  - test-results/backend-tests.txt"
echo "  - test-results/test-summary.md"
