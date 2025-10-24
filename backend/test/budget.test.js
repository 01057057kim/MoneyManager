const request = require('supertest');
const app = require('../server');
const Budget = require('../models/Budget');
const User = require('../models/User');
const Group = require('../models/Group');
const jwt = require('jsonwebtoken');

describe('Budget API', () => {
  let authToken;
  let userId;
  let groupId;
  let budgetId;

  beforeAll(async () => {
    // Create test user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
    userId = user._id;

    // Create test group
    const group = new Group({
      name: 'Test Group',
      owner: userId,
      currency: 'USD',
      taxRate: 0
    });
    await group.save();
    groupId = group._id;

    // Generate auth token
    authToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    // Clean up test data
    await Budget.deleteMany({});
    await Group.deleteMany({});
    await User.deleteMany({});
  });

  describe('POST /api/budgets', () => {
    it('should create a new budget', async () => {
      const budgetData = {
        name: 'Test Budget',
        group: groupId,
        category: 'Food',
        limit: 500,
        period: 'monthly',
        startDate: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(budgetData.name);
      expect(response.body.data.limit).toBe(budgetData.limit);
      expect(response.body.data.category).toBe(budgetData.category);
      
      budgetId = response.body.data._id;
    });

    it('should reject budget with invalid data', async () => {
      const invalidData = {
        name: '', // Empty name
        group: 'invalid-id',
        category: '',
        limit: -100, // Negative limit
        period: 'invalid'
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
    });

    it('should reject duplicate budget for same category and period', async () => {
      const budgetData = {
        name: 'Duplicate Budget',
        group: groupId,
        category: 'Food', // Same category as before
        limit: 300,
        period: 'monthly', // Same period as before
        startDate: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Duplicate Budget');
    });
  });

  describe('GET /api/budgets', () => {
    it('should get all budgets for user', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter budgets by group', async () => {
      const response = await request(app)
        .get(`/api/budgets?groupId=${groupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/budgets?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/budgets/:id', () => {
    it('should get a single budget', async () => {
      const response = await request(app)
        .get(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(budgetId);
    });

    it('should return 404 for non-existent budget', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/budgets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/budgets/:id', () => {
    it('should update a budget', async () => {
      const updateData = {
        name: 'Updated Budget',
        limit: 750
      };

      const response = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.limit).toBe(updateData.limit);
    });
  });

  describe('DELETE /api/budgets/:id', () => {
    it('should delete a budget', async () => {
      const response = await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Budget deleted successfully');
    });
  });

  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No token provided');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid token');
    });
  });
});
