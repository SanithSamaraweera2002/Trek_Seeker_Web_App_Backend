import request from 'supertest';
import sequelize from '../../config/database';
import app from '../../index';

const mockTravelerData = {
  FirstName: 'Sanith',
  LastName: 'Samaraweera',
  Email: 'sanithsjs+testingnew3@gmail.com',
  Password: 'Sanith@123',
  Country: 'Sri Lanka',
  Gender: 'Male',
};

let travelerId: number;
let token: string;
let travelerToken: string;

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

describe('CRUD Traveler Module', () => {
  it('should register a new traveler', async () => {
    const response = await request(app).post('/api/traveler/register').send(mockTravelerData).expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user.Email).toBe(mockTravelerData.Email);

    const UseLoginResponse = await request(app).post('/api/login').send({
      Email: mockTravelerData.Email,
      Password: mockTravelerData.Password,
    });

    travelerId = UseLoginResponse.body.id;
    travelerToken = UseLoginResponse.body.token;
  });

  it('should return error if email already exists', async () => {
    const response = await request(app).post('/api/traveler/register').send(mockTravelerData).expect(400);

    expect(response.body).toHaveProperty('message', 'Email already exists');
  });

  it('should get all travelers', async () => {
    const response = await request(app)
      .get('/api/travelers')
      .set('Authorization', `Bearer ${token}`)
      .query({ limit: 10, page: 1 })
      .expect(200);

    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body).toHaveProperty('total');
  });

  it('should get a traveler by ID', async () => {
    const response = await request(app)
      .get(`/api/traveler/${travelerId}`)
      .set('Authorization', `Bearer ${travelerToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('TravelerID', travelerId);
    expect(response.body).toHaveProperty('FirstName', mockTravelerData.FirstName);
  });

  it('should return 404 if traveler is not found', async () => {
    const response = await request(app)
      .get(`/api/traveler/999999`)
      .set('Authorization', `Bearer ${travelerToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Traveler not found');
  });

  it('should update traveler details', async () => {
    const updatedData = {
      FirstName: 'Kaushi',
      LastName: 'Prasadhi',
      Email: 'kpw2003@gmail.com',
    };

    const response = await request(app)
      .put(`/api/traveler/${travelerId}`)
      .set('Authorization', `Bearer ${travelerToken}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.traveler.FirstName).toBe(updatedData.FirstName);
    expect(response.body.traveler.LastName).toBe(updatedData.LastName);
  });

  it('should delete traveler (set status to inactive)', async () => {
    const response = await request(app)
      .delete(`/api/traveler/${travelerId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Traveler deleted successfully');

    const checkResponse = await request(app)
      .get(`/api/traveler/${travelerId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(checkResponse.body).toHaveProperty('message', 'Traveler not found');
  });

  it('should return 404 if trying to delete a non-existent traveler', async () => {
    const response = await request(app)
      .delete(`/api/traveler/999999`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Traveler not found');
  });
});
