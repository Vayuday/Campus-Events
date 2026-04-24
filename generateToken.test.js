const request = require('supertest');
const app = require('../../server/src/app');
const User = require('../../server/src/models/User');
const Event = require('../../server/src/models/Event');
const Category = require('../../server/src/models/Category');

describe('Registration API', () => {
  let studentToken;
  let eventId;

  beforeAll(async () => {
    // 1. Create a student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Ticket Student',
      email: 'ticketstudent@test.edu',
      password: 'password123',
      role: 'student',
    });
    studentToken = studentRes.body.data.accessToken;

    // 2. Create an admin directly since registration API converts admin to student
    const adminUser = await User.create({
      name: 'Admin',
      email: 'adminreg@test.edu',
      password: 'password123',
      role: 'admin',
    });
    
    // Login to get token
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'adminreg@test.edu',
      password: 'password123'
    });
    const adminToken = adminRes.body.data.accessToken;

    // 3. Create a Category
    const catRes = await Category.create({ name: 'Tech', color: '#000', icon: '💻' });

    // 4. Create and approve an Event
    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Registration Test Event',
        description: 'Testing ticket booking',
        category: catRes._id.toString(),
        venue: 'Main Hall',
        date: new Date(Date.now() + 86400000).toISOString(),
        startTime: '10:00',
        endTime: '12:00',
        maxParticipants: 10,
      });
      
    eventId = eventRes.body.data.event._id;

    // Approve the event manually as admin
    await request(app)
      .put(`/api/admin/events/${eventId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
  });

  it('student should be able to book a ticket', async () => {
    const res = await request(app)
      .post(`/api/registrations/${eventId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.registration.status).toBe('confirmed');

    // Verify event registeredCount went up
    const event = await Event.findById(eventId);
    expect(event.registeredCount).toBe(1);
  });

  it('student should not be able to book twice', async () => {
    const res = await request(app)
      .post(`/api/registrations/${eventId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(400); // Bad Request (Already registered)
  });

  it('student should be able to fetch their tickets', async () => {
    const res = await request(app)
      .get('/api/registrations/my-tickets')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.registrations.length).toBe(1);
    expect(res.body.data.registrations[0].event._id).toBe(eventId.toString());
  });
});
