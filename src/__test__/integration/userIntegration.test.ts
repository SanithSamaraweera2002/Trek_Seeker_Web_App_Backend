import request from 'supertest';
import sequelize from '../../config/database';
import app from '../../index';

let token: string;
let userId: number;

beforeAll(async () => {
  await sequelize.authenticate();

  const loginResponse = await request(app).post('/api/login').send({
    Email: 'gimhanasandaruwan@gmail.com',
    Password: 'GimhanaTestNewPass@123',
  });

  token = loginResponse.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('User Module Integration Tests', () => {
  const mockUserData = {
    FirstName: 'Test',
    LastName: 'User',
    Email: 'newadminuser2@gmail.com',
    Password: 'Password@123',
    Permission: 'traveler',
  };

  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send(mockUserData)
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user.Email).toBe(mockUserData.Email);

    userId = response.body.user.UserID;
  });

  it('should return all users with pagination', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .query({ limit: 10, page: 1 })
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body).toHaveProperty('total');
  });

  it('should get a user by ID', async () => {
    const response = await request(app).get(`/api/users/${userId}`).set('Authorization', `Bearer ${token}`).expect(200);

    expect(response.body).toHaveProperty('UserID', userId);
    expect(response.body).toHaveProperty('Email', mockUserData.Email);
  });

  it('should return 404 if user is not found', async () => {
    const response = await request(app).get('/api/users/999999').set('Authorization', `Bearer ${token}`).expect(404);

    expect(response.body).toHaveProperty('message', 'User not found');
  });

  it('should update a user', async () => {
    const updatedData = {
      FirstName: 'Updated',
      LastName: 'User',
      Email: 'updateduser@gmail.com',
    };

    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData)
      .expect(200);

    expect(response.body).toHaveProperty('UserID', userId);
    expect(response.body.Email).toBe(updatedData.Email);
    expect(response.body.FirstName).toBe(updatedData.FirstName);
  });

  it('should return 400 when trying to update with an existing email', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        Email: 'newadminuser@gmail.com',
      })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Email already exists');
  });

  it('should delete a user', async () => {
    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'User deleted successfully');

    const checkResponse = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(checkResponse.body).toHaveProperty('message', 'User not found');
  });

  it('should return 404 when trying to delete a not available user', async () => {
    const response = await request(app).delete('/api/users/999999').set('Authorization', `Bearer ${token}`).expect(404);

    expect(response.body).toHaveProperty('message', 'User not found');
  });
});
