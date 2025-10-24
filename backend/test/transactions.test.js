const request = require('supertest')
const app = require('../server')
const User = require('../models/User')
const Transaction = require('../models/Transaction')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

describe('Transaction Routes', () => {
  let authToken
  let userId

  beforeEach(async () => {
    // Clean up data before each test
    await User.deleteMany({})
    await Transaction.deleteMany({})

    // Create a test user and get auth token
    const hashedPassword = await bcrypt.hash('password123', 10)
    const user = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User'
    })
    
    userId = user._id
    authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret')
  })

  describe('GET /api/transactions', () => {
    it('should get user transactions when authenticated', async () => {
      // Create some test transactions
      await Transaction.create([
        {
          userId,
          amount: 100,
          description: 'Test transaction 1',
          type: 'income',
          category: 'salary'
        },
        {
          userId,
          amount: 50,
          description: 'Test transaction 2',
          type: 'expense',
          category: 'food'
        }
      ])

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toHaveProperty('amount')
      expect(response.body[0]).toHaveProperty('description')
    })

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/api/transactions')
        .expect(401)
    })
  })

  describe('POST /api/transactions', () => {
    it('should create a new transaction when authenticated', async () => {
      const transactionData = {
        amount: 100,
        description: 'Test transaction',
        type: 'income',
        category: 'salary'
      }

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.amount).toBe(100)
      expect(response.body.description).toBe('Test transaction')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should return 401 when not authenticated', async () => {
      const transactionData = {
        amount: 100,
        description: 'Test transaction',
        type: 'income',
        category: 'salary'
      }

      await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(401)
    })
  })

  describe('PUT /api/transactions/:id', () => {
    it('should update a transaction when authenticated', async () => {
      // Create a transaction first
      const transaction = await Transaction.create({
        userId,
        amount: 100,
        description: 'Original description',
        type: 'income',
        category: 'salary'
      })

      const updateData = {
        amount: 150,
        description: 'Updated description'
      }

      const response = await request(app)
        .put(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.amount).toBe(150)
      expect(response.body.description).toBe('Updated description')
    })

    it('should not update transaction of another user', async () => {
      // Create another user
      const anotherUser = await User.create({
        email: 'another@example.com',
        password: 'password123',
        name: 'Another User'
      })

      // Create transaction for another user
      const transaction = await Transaction.create({
        userId: anotherUser._id,
        amount: 100,
        description: 'Another user transaction',
        type: 'income',
        category: 'salary'
      })

      const updateData = {
        amount: 150,
        description: 'Hacked description'
      }

      await request(app)
        .put(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403)
    })
  })

  describe('DELETE /api/transactions/:id', () => {
    it('should delete a transaction when authenticated', async () => {
      // Create a transaction first
      const transaction = await Transaction.create({
        userId,
        amount: 100,
        description: 'To be deleted',
        type: 'income',
        category: 'salary'
      })

      await request(app)
        .delete(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Verify transaction is deleted
      const deletedTransaction = await Transaction.findById(transaction._id)
      expect(deletedTransaction).toBeNull()
    })
  })
})
