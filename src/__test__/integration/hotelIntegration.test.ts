import request from 'supertest';
import sequelize from '../../config/database';
import app from '../../index';

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Hotel Recommendation Module', () => {
  it('should return hotel recommendations for destinations', async () => {
    const mockDestinations = [
      {
        latitude: 37.7749,
        longitude: -122.4194,
        day: 1,
      },
      {
        latitude: 34.0522,
        longitude: -118.2437,
        day: 2,
      },
    ];

    const response = await request(app)
      .post('/api/hotels/recommendations')
      .send({ destinations: mockDestinations })
      .expect(200);

    // Check if the response contains recommendations
    expect(response.body).toHaveProperty('recommendations');
    expect(response.body.recommendations).toBeInstanceOf(Array);
    expect(response.body.recommendations.length).toBe(mockDestinations.length);

    response.body.recommendations.forEach((recommendation: any) => {
      expect(recommendation).toHaveProperty('day');
      expect(recommendation).toHaveProperty('hotels');
      expect(recommendation.hotels).toBeInstanceOf(Array);
      expect(recommendation.hotels.length).toBeLessThanOrEqual(3); // Assuming we are recommending a max of 3 hotels
      recommendation.hotels.forEach((hotel: any) => {
        expect(hotel).toHaveProperty('name');
        expect(hotel).toHaveProperty('rating');
        expect(hotel).toHaveProperty('address');
        expect(hotel).toHaveProperty('image');
      });
    });
  });

  it('should throw error if invalid data types', async () => {
    const invalidDestinations = [
      {
        latitude: 'invalid_latitude',
        longitude: 'invalid_longitude',
        day: 'invalid_day',
      },
    ];

    const response = await request(app)
      .post('/api/hotels/recommendations')
      .send({ destinations: invalidDestinations })
      .expect(400);

    // console.log('response', response);

    expect(response.body).toHaveProperty('message', 'Invalid input data');
  });
});
