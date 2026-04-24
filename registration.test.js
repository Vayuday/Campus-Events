const request = require('supertest');
const app = require('../../server/src/app');
const User = require('../../server/src/models/User');
const Category = require('../../server/src/models/Category');

describe('Event API', () => {
  let organizerToken;
  let studentToken;
  let categoryId;
  let eventId;

  const testOrganizer = {
    name: 'Test Organizer',
    email: 'organizer@test.edu',
    password: 'password123',
    role: 'organizer',
  };

  const testStudent = {
    name: 'Test Student',
    email: 'student@test.edu',
    password: 'password123',
    role: 'student',
  };

  beforeAll(async () => {
    // Register organizer
    const orgRes = await request(app).post('/api/auth/register').send(testOrganizer);
    organizerToken = orgRes.body.data.accessToken;

    // Register student
    const stuRes = await request(app).post('/api/auth/register').send(testStudent);
    studentToken = stuRes.body.data.accessToken;

    // Create a category
    const catRes = await Category.create({ name: 'Workshop', color: '#111', icon: '💻' });
    categoryId = catRes._id;
  });

  it('organizer should be able to create an event', async () => {
    const newEvent = {
      title: 'Intro to Testing',
      description: 'Learn how to write integration tests with Jest and Supertest.',
      category: categoryId.toString(),
      venue: 'Lab 1',
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      startTime: '10:00',
      endTime: '12:00',
      maxParticipants: 50,
      tags: 'testing,jest'
    };

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send(newEvent);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.event.title).toBe(newEvent.title);
    expect(res.body.data.event.status).toBe('pending');
    
    eventId = res.body.data.event._id;
  });

  it('student should not be able to create an event', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Student Event',
        category: categoryId.toString(),
        venue: 'Lab',
        date: new Date().toISOString(),
        startTime: '10:00',
        endTime: '12:00',
        maxParticipants: 50,
      });

    expect(res.statusCode).toEqual(403);
  });

  it('should fetch approved events (public)', async () => {
    const res = await request(app).get('/api/events');
    
    // Initially the created event is 'pending', so it shouldn't show up here
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});
