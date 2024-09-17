import request from 'supertest';
import app from '../../index';
import sequelize from '../../config/database';
import City from '../../models/citiesModel';

describe('CRUD City Module', () => {
  let token: string;
  let cityId: number;

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

  describe('POST /city - Create a new city', () => {
    it('should create a new city successfully', async () => {
      const response = await request(app).post('/api/city').set('Authorization', `Bearer ${token}`).send({
        CityName: 'New SL City New',
        CityDescription: 'New city for testing',
        CityLatitude: 34.0522,
        CityLongitude: -118.2437,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'City created successfully');
      expect(response.body.city).toHaveProperty('CityName', 'New SL City New');

      cityId = response.body.city.CityID;
    });

    it('should return an error if the city already exists', async () => {
      const response = await request(app).post('/api/city').set('Authorization', `Bearer ${token}`).send({
        CityName: 'New SL City New',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'City already exists');
    });
  });

  describe('GET /cities - Retrieve all cities', () => {
    it('should retrieve a list of cities', async () => {
      const totalCities = await City.count();
      const response = await request(app)
        .get('/api/cities')
        .set('Authorization', `Bearer ${token}`)
        .query({ limit: 10, page: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty('CityName', 'Colombo');
      expect(response.body).toHaveProperty('total', totalCities);
    });
  });

  describe('GET /city/:id - Retrieve a city by ID', () => {
    it.only('should retrieve the city details successfully', async () => {
      const response = await request(app).get(`/api/city/${cityId}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('CityName', 'New SL City New');
    });

    it('should return 404 if the city does not exist', async () => {
      const response = await request(app).get('/api/city/9999').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'City not found');
    });
  });

  describe('PUT /city/:id - Update a city', () => {
    it('should update the city successfully', async () => {
      const response = await request(app).put(`/api/city/${cityId}`).set('Authorization', `Bearer ${token}`).send({
        CityName: 'Updated Test City New',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'City updated successfully');
      expect(response.body.city).toHaveProperty('CityName', 'Updated Test City New');
    });

    it('should return an error if the city does not exist', async () => {
      const response = await request(app).put('/api/city/9999').set('Authorization', `Bearer ${token}`).send({
        CityName: 'Not Available City',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'City not found');
    });
  });

  describe('DELETE /city/:id - Delete a city', () => {
    it('should delete the city successfully', async () => {
      const response = await request(app).delete(`/api/city/${cityId}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'City deleted successfully');
    });

    it('should return an error if the city does not exist', async () => {
      const response = await request(app).delete('/api/city/9999').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'City not found');
    });
  });
});
