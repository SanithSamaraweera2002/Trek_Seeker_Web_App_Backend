import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { generateTrip } from '../../services/generateTripService';
import City from '../../models/citiesModel';
import Destination from '../../models/destinationModel';

const mock = new MockAdapter(axios);

describe('generateTrip', () => {
  beforeEach(() => {
    // Reset mock adapter
    mock.reset();
  });

  it('should generate a trip itinerary based on user input', async () => {
    const mockCity = {
      CityID: 1,
      CityName: 'Kandy',
      CityDescription: 'Kandy Description',
      CityImage: 'http://awss3.com/city-image.jpg',
    };
    jest.spyOn(City, 'findByPk').mockResolvedValue(mockCity as any);

    const mockDestination = {
      DestinationID: 101,
      DestinationName: 'Temple of the Sacred Tooth Relic',
      Latitude: '7.2906',
      Longitude: '80.6337',
      Description: 'A sacred temple',
      Image: 'http://awss3.com/destination-image.jpg',
      Ratings: 4.5,
    };
    jest.spyOn(Destination, 'findOne').mockResolvedValue(mockDestination as any);

    const mockMLResponse = [
      {
        DayNumber: 1,
        destinations: [
          {
            destination: 'Temple of the Sacred Tooth Relic',
            destinationOrder: 1,
            timeFrom: '09:00 AM',
            timeTo: '10:30 AM',
          },
        ],
      },
    ];
    mock.onPost('http://127.0.0.1:8000/recommendations/').reply(200, mockMLResponse);

    // Input data
    const requestData = {
      cityID: 1,
      userInterests: ['Religious', 'Nature_Wildlife'],
      budget: 1,
      startDate: '2024-09-01',
      endDate: '2024-09-01',
      travelerCategory: 'Solo',
      ageCategory: '18-24',
      gender: 'female',
      nationality: 'US',
    };

    const result = await generateTrip(requestData);

    const expectedResponse = {
      CityID: 1,
      StartDate: '2024-09-01',
      EndDate: '2024-09-01',
      Duration: 1,
      City: {
        CityName: 'Kandy',
        CityDescription: 'Kandy Description',
        CityImage: 'http://awss3.com/city-image.jpg',
      },
      Itineraries: [
        {
          DayNumber: 1,
          destinations: [
            {
              DestinationID: 101,
              DestinationName: 'Temple of the Sacred Tooth Relic',
              Latitude: '7.2906',
              Longitude: '80.6337',
              Description: 'A sacred temple',
              Image: 'http://awss3.com/destination-image.jpg',
              Rating: 4.5,
              OrderNumber: 1,
              TimeFrom: '09:00 AM',
              TimeTo: '10:30 AM',
            },
          ],
        },
      ],
    };

    expect(result).toEqual(expectedResponse);
  });

  it('should throw an error if the city is not found', async () => {
    jest.spyOn(City, 'findByPk').mockResolvedValue(null);

    const requestData = {
      cityID: 1,
      userInterests: ['Religious', 'Nature_Wildlife'],
      budget: 1,
      startDate: '2024-09-01',
      endDate: '2024-09-07',
      travelerCategory: 'Solo',
      ageCategory: '18-24',
      gender: 'female',
      nationality: 'US',
    };

    await expect(generateTrip(requestData)).rejects.toThrow('No Data Available on Selected City');
  });

  it('should throw an error if a destination is not found', async () => {
    const mockCity = {
      CityID: 1,
      CityName: 'Kandy',
      CityDescription: 'Kandy Description',
      CityImage: 'http://awss3.com/city-image.jpg',
    };
    jest.spyOn(City, 'findByPk').mockResolvedValue(mockCity as any);

    jest.spyOn(Destination, 'findOne').mockResolvedValue(null);

    const mockMLResponse = [
      {
        DayNumber: 1,
        destinations: [
          {
            DestinationName: 'Unknown Destination',
            OrderNumber: 1,
            TimeFrom: '09:00 AM',
            TimeTo: '10:30 AM',
          },
        ],
      },
    ];
    mock.onPost('http://127.0.0.1:8000/recommendations/').reply(200, mockMLResponse);

    const requestData = {
      cityID: 1,
      userInterests: ['Religious', 'Nature_Wildlife'],
      budget: 1,
      startDate: '2024-09-01',
      endDate: '2024-09-07',
      travelerCategory: 'Solo',
      ageCategory: '18-24',
      gender: 'female',
      nationality: 'US',
    };

    await expect(generateTrip(requestData)).rejects.toThrow('Destination: Unknown Destination - Data not found');
  });
});
