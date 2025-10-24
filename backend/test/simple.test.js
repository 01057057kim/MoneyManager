// Simple backend tests that don't require database connection
const request = require('supertest')

describe('Basic Server Tests', () => {
  let app

  beforeAll(async () => {
    // Mock the database connection to avoid connection issues
    jest.mock('../config/database', () => ({
      connectDB: jest.fn()
    }))
    
    // Import app after mocking
    app = require('../server')
  })

  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200)

    expect(response.body).toHaveProperty('status', 'OK')
  })

  it('should handle 404 for unknown routes', async () => {
    await request(app)
      .get('/api/unknown-route')
      .expect(404)
  })

  it('should have CORS enabled', async () => {
    const response = await request(app)
      .options('/api/health')
      .expect(204)

    expect(response.headers['access-control-allow-origin']).toBeDefined()
  })
})
