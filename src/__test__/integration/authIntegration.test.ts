import request from 'supertest';
import app from '../../index';
import sequelize from '../../config/database';
import User from '../../models/userModel';
import bcrypt from 'bcrypt';

describe('POST /api/login', () => {
  let userId: number;

  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should return a token and user details for valid credentials', async () => {
    const uniqueEmail = `testuser${Date.now()}@gmail.com`;

    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await User.create({
      UserName: 'New Test User',
      FirstName: 'Test',
      LastName: 'User',
      Email: uniqueEmail,
      Password: passwordHash,
      Permission: 'admin',
    });
    userId = user.UserID;

    const response = await request(app).post('/api/login').send({
      Email: uniqueEmail,
      Password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('username', 'New Test User');
    expect(response.body).toHaveProperty('email', uniqueEmail);
    expect(response.body).toHaveProperty('role', 'admin');
    expect(response.body).toHaveProperty('firstname', 'Test');
    expect(response.body).toHaveProperty('id');
  });

  it('should return 404 if the user is not found', async () => {
    const response = await request(app).post('/api/login').send({
      Email: 'notavailableuser@gmail.com',
      Password: 'password123',
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'User not found');
  });

  it('should return 401 if the password is incorrect', async () => {
    const uniqueEmail = `testuser${Date.now()}_invalid@gmail.com`;

    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await User.create({
      UserName: 'New Test User',
      FirstName: 'Test',
      LastName: 'User',
      Email: uniqueEmail,
      Password: passwordHash,
      Permission: 'admin',
    });
    userId = user.UserID;

    const response = await request(app).post('/api/login').send({
      Email: uniqueEmail,
      Password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid password');
  });
});
