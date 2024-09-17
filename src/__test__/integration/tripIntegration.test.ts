import request from 'supertest';
import sequelize from '../../config/database';
import app from '../../index';

let token: string;
let travelerId: number;
let tripId: number;

beforeAll(async () => {
  await sequelize.authenticate();

  const loginResponse = await request(app).post('/api/login').send({
    Email: 'sanithsjs+newusertest@gmail.com',
    Password: 'Sanith@123',
  });

  token = loginResponse.body.token;
  travelerId = loginResponse.body.id;
  // console.log('RESPONSE', loginResponse.body);
});

afterAll(async () => {
  await sequelize.close();
});

describe('CRUD Trip Module', () => {
  it('should create a new trip with itineraries', async () => {
    const mockTripData = {
      CityID: 1,
      TripName: 'Test Trip',
      StartDate: '2024-10-01',
      EndDate: '2024-10-05',
      TravelerID: travelerId,
      Itineraries: [
        {
          DayNumber: 1,
          DestinationID: 2,
          OrderNumber: 1,
          TimeFrom: '09:00',
          TimeTo: '11:00',
        },
        {
          DayNumber: 1,
          DestinationID: 3,
          OrderNumber: 2,
          TimeFrom: '12:00',
          TimeTo: '14:00',
        },
      ],
      Accommodations: [
        { DayNumber: 1, PlaceID: 'ChIJxRELOa2B4zoRHt41suW8MYc' },
        { DayNumber: 2, PlaceID: 'ChIJaSv3agyB4zoR8FiHmF54MhY' },
      ],
    };
    const response = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${token}`)
      .send(mockTripData)
      .expect(201);

    expect(response.body).toHaveProperty('trip');
    expect(response.body.trip.TripName).toBe(mockTripData.TripName);

    tripId = response.body.trip.TripID;
  });

  it('should return all trips for a traveler', async () => {
    const response = await request(app)
      .get(`/api/trips/${travelerId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('TripID');
    expect(response.body[0]).toHaveProperty('CityID');
  });

  it('should get a specific trip by ID', async () => {
    const response = await request(app)
      .get(`/api/trips/details/${tripId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('TripID', tripId);
    expect(response.body).toHaveProperty('Itineraries');
    expect(response.body.Itineraries.length).toBeGreaterThan(0);
    expect(response.body).toHaveProperty('Accommodations');
    expect(response.body.Accommodations.length).toBeGreaterThan(0);
  });

  it('should return 404 if trip is not found', async () => {
    const response = await request(app)
      .get(`/api/trips/details/999999`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Trip not found');
  });

  it('should delete a trip', async () => {
    const response = await request(app)
      .delete(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Trip deleted successfully');

    const checkResponse = await request(app)
      .get(`/api/trips/details/${tripId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(checkResponse.body).toHaveProperty('message', 'Trip not found');
  });

  it('should return 404 when trying to delete a not available trip', async () => {
    const response = await request(app).delete(`/api/trips/999999`).set('Authorization', `Bearer ${token}`).expect(404);

    expect(response.body).toHaveProperty('message', 'Trip not found');
  });
});
