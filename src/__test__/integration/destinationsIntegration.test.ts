import request from 'supertest';
import app from '../../index';
import sequelize from '../../config/database';
import Destination from '../../models/destinationModel';
import City from '../../models/citiesModel';

describe('CRUD Destinations Module', () => {
  let token: string;
  let destinationId: number;
  let testCityId: number;

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

  describe('POST /destinations - Create a new destination', () => {
    beforeAll(async () => {
      const cityResponse = await City.create({
        CityName: 'New Test City for destination add',
        CityDescription: 'A city created for testing purposes',
        CityLatitude: 12.34,
        CityLongitude: 56.78,
      });
      testCityId = cityResponse.CityID;
    });

    it('should create a new destination successfully', async () => {
      const response = await request(app).post('/api/destinations').set('Authorization', `Bearer ${token}`).send({
        DestinationName: 'New Destination',
        Description: 'A new destination for testing',
        CityID: testCityId,
        Latitude: 34.0522,
        Longitude: -118.2437,
        Ratings: 4.5,
        TimeSpent: 3,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Destination created successfully');
      expect(response.body.destination).toHaveProperty('DestinationName', 'New Destination');

      destinationId = response.body.destination.DestinationID;
    });
  });

  describe('GET /destinations - Retrieve all destinations', () => {
    it('should retrieve a list of destinations', async () => {
      const response = await request(app)
        .get('/api/destinations')
        .set('Authorization', `Bearer ${token}`)
        .query({ limit: 10, page: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty('DestinationName');
      expect(response.body).toHaveProperty('total');
    });
  });

  describe('GET /destinations/:id - Retrieve a destination by ID', () => {
    it('should retrieve the destination details successfully', async () => {
      const response = await request(app)
        .get(`/api/destinations/${destinationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('DestinationName', 'New Destination');
    });

    it('should return 404 if the destination does not exist', async () => {
      const response = await request(app).get('/api/destinations/9999').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Destination not found');
    });
  });

  describe('PUT /destinations/:id - Update a destination', () => {
    it('should update the destination successfully', async () => {
      const response = await request(app)
        .put(`/api/destinations/${destinationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          DestinationName: 'Updated Destination',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Destination updated successfully');
      expect(response.body.destination).toHaveProperty('DestinationName', 'Updated Destination');
    });

    it('should return an error if the destination does not exist', async () => {
      const response = await request(app).put('/api/destinations/9999').set('Authorization', `Bearer ${token}`).send({
        DestinationName: 'Non-Existent Destination',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Destination not found');
    });
  });

  describe('DELETE /destinations/:id - Delete a destination', () => {
    it('should delete the destination successfully', async () => {
      const response = await request(app)
        .delete(`/api/destinations/${destinationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Destination deleted successfully');
    });

    it('should return an error if the destination does not exist', async () => {
      const response = await request(app).delete('/api/destinations/9999').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Destination not found');
    });
  });
});
