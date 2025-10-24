# Money Manager Backend API

A robust Node.js/Express backend for the Money Manager application with comprehensive financial tracking, budget management, and group collaboration features.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Group Management**: Multi-user financial groups with different permission levels
- **Budget Tracking**: Create and monitor budgets with real-time spending analysis
- **Transaction Management**: Income and expense tracking with categorization
- **Category Management**: Customizable transaction categories
- **Recurring Transactions**: Automated recurring income and expenses
- **Advanced Analytics**: Spending insights and financial reports
- **Real-time Notifications**: Budget alerts and spending warnings
- **File Upload**: Receipt and document management
- **API Documentation**: Comprehensive REST API with validation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Custom logging system with file rotation
- **Testing**: Jest with Supertest

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Money/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   MONGO_URI=mongodb://localhost:27017/money-manager
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Groups
- `GET /api/groups/my-groups` - Get user's groups
- `POST /api/groups/create` - Create new group
- `POST /api/groups/join` - Join group with invite key
- `PUT /api/groups/:id` - Update group settings
- `DELETE /api/groups/:id` - Delete group

### Budgets
- `GET /api/budgets` - Get budgets (with pagination)
- `POST /api/budgets` - Create budget
- `GET /api/budgets/:id` - Get single budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/:id/analytics` - Budget analytics

### Transactions
- `GET /api/transactions` - Get transactions (with filters)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get single transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:name` - Update category
- `DELETE /api/categories/:name` - Delete category
- `GET /api/categories/:name/analytics` - Category analytics

## 🔒 Security Features

- **Rate Limiting**: Configurable rate limits for different endpoints
- **Input Validation**: Comprehensive validation with sanitization
- **CORS Protection**: Configurable CORS policies
- **Helmet Security**: Security headers and protection
- **JWT Authentication**: Secure token-based authentication
- **Request Logging**: Detailed request/response logging
- **Error Handling**: Centralized error handling with logging

## 📝 Logging

The application includes comprehensive logging:

- **Request Logging**: All API requests with timing
- **Error Logging**: Detailed error tracking with stack traces
- **Security Logging**: Authentication and authorization events
- **Performance Logging**: Database query timing and optimization
- **File Logging**: Daily log files with rotation

Logs are stored in the `logs/` directory with daily rotation.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance Optimizations

- **Database Indexing**: Optimized MongoDB indexes
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Reduced database queries
- **Caching**: Strategic caching for frequently accessed data
- **Pagination**: Efficient data pagination
- **Compression**: Response compression for large datasets

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `LOG_LEVEL` | Logging level | `INFO` |

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File Upload**: 10 requests per minute

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure MongoDB Atlas
4. Set up proper logging
5. Configure rate limiting
6. Set up monitoring
7. Enable HTTPS
8. Configure backup strategy

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Monitoring

The application includes health check endpoints:

- `GET /api/health` - Detailed health information
- Database connection status
- Memory usage
- Uptime tracking
- Version information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the logs for errors
- Contact the development team
