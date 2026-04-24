// Use the server's mongoose instance to ensure the same connection is shared with the app
const mongoose = require('../../server/node_modules/mongoose');

// Mock uuid to fix Jest ESM import error
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-1234-5678',
}));

// Connect to the test database before each test suite
beforeAll(async () => {
  const mongoUri = 'mongodb://127.0.0.1:27017/campus_events_test';

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri);
  await mongoose.connection.dropDatabase();
});

// Close database connection after each test suite
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});
