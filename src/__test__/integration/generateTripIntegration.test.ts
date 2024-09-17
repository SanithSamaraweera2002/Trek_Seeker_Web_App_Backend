import request from 'supertest';
import axios from 'axios';
import app from '../../index';
import sequelize from '../../config/database';

jest.mock('axios');

describe('POST /api/generate-trip', () => {
  let token: string;
  let mockAxios: jest.Mocked<typeof axios>;

  beforeAll(async () => {
    await sequelize.authenticate();

    const loginResponse = await request(app).post('/api/login').send({
      Email: 'sanithsjs@gmail.com',
      Password: 'Sanith@123',
    });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /generate-trip - Generate a trip itinerary', () => {
    const requestBody = {
      cityID: 1,
      userInterests: ['Religious', 'Nature_Wildlife'],
      budget: 1,
      startDate: '2024-09-01',
      endDate: '2024-09-02',
      travelerCategory: 'Solo',
      ageCategory: '18-24',
      gender: 'male',
      nationality: 'UK',
    };

    const mockResponse = [
      {
        DayNumber: 1,
        destinations: [
          {
            dayNumber: 1,
            destination: 'Attidiya Bird Sanctuary',
            destinationOrder: 1,
            timeFrom: '08:00 AM',
            timeTo: '09:00 AM',
            visitTime: 60,
            travel_time: 30,
          },
          {
            dayNumber: 1,
            destination: 'Beddagana Wetland Park',
            destinationOrder: 2,
            timeFrom: '09:30 AM',
            timeTo: '11:30 AM',
            visitTime: 120,
            travel_time: 49,
          },
        ],
      },
      {
        DayNumber: 2,
        destinations: [
          {
            dayNumber: 2,
            destination: 'Galle Face Green',
            destinationOrder: 1,
            timeFrom: '08:00 AM',
            timeTo: '11:00 AM',
            visitTime: 180,
            travel_time: 36,
          },
          {
            dayNumber: 2,
            destination: 'Kelaniya Raja Maha Viharaya',
            destinationOrder: 2,
            timeFrom: '11:36 AM',
            timeTo: '01:21 PM',
            visitTime: 105,
            travel_time: 59,
          },
        ],
      },
    ];

    beforeAll(() => {
      mockAxios = axios as jest.Mocked<typeof axios>;
      mockAxios.post.mockResolvedValue({ data: mockResponse });
    });

    it('should generate a trip itinerary successfully', async () => {
      const response = await request(app)
        .post('/api/generate-trip')
        .set('Authorization', `Bearer ${token}`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('CityID', 1);
      expect(response.body).toHaveProperty('StartDate', '2024-09-01');
      expect(response.body).toHaveProperty('EndDate', '2024-09-02');
      expect(response.body).toHaveProperty('Duration', 2);
      expect(response.body).toHaveProperty('City');
      expect(response.body.City).toHaveProperty('CityName', 'Colombo');
      expect(response.body).toHaveProperty('Itineraries');
      expect(response.body.Itineraries).toBeInstanceOf(Array);
      expect(response.body.Itineraries[0]).toHaveProperty('DayNumber', 1);
      expect(response.body.Itineraries[0].destinations[0]).toHaveProperty('DestinationName', 'Attidiya Bird Sanctuary');
    });

    it('should return an error if city does not exist', async () => {
      const invalidRequestBody = { ...requestBody, cityID: 9999 };

      const response = await request(app)
        .post('/api/generate-trip')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidRequestBody);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'No Data Available on Selected City');
    });

    afterAll(() => {
      jest.resetAllMocks();
    });
  });
});
