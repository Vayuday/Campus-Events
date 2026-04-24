const request = require('supertest');
const app = require('../../server/src/app');
const User = require('../../server/src/models/User');

describe('Category API', () => {
  let adminToken;
  let studentToken;
  let categoryId;

  beforeAll(async () => {
    // Create an admin directly
    const adminUser = await User.create({
      name: 'Cat Admin',
      email: 'catadmin@test.edu',
      password: 'password123',
      role: 'admin',
    });
    
    // Login to get token
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'catadmin@test.edu',
      password: 'password123'
    });
    adminToken = adminRes.body.data.accessToken;

    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Cat Student',
      email: 'catstudent@test.edu',
      password: 'password123',
      role: 'student',
    });
    studentToken = studentRes.body.data.accessToken;
  });

  it('admin should be able to create a category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Sports',
        color: '#ff0000',
        icon: '⚽',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category.name).toBe('Sports');
    categoryId = res.body.data.category._id;
  });

  it('student should not be able to create a category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'Hack', color: '#000', icon: '💻' });

    expect(res.statusCode).toEqual(403); // Forbidden
  });

  it('anyone should be able to fetch categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.categories.length).toBeGreaterThan(0);
    expect(res.body.data.categories[0].name).toBe('Sports');
  });
});
