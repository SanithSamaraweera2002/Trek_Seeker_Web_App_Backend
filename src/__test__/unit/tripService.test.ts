import { createTrip, getAllTrips, getTripById, deleteTrip } from '../../services/tripService';
import Trip from '../../models/tripModel';
import Itinerary from '../../models/itineraryModel';
import City from '../../models/citiesModel';
import Destination from '../../models/destinationModel';
import HotelAssign from '../../models/hotelAssignmentsModel';
import { getGooglePlaceDetails } from '../../services/hotelService';

jest.mock('../../config/database', () => ({
  transaction: jest.fn().mockReturnValue({
    commit: jest.fn(),
    rollback: jest.fn(),
  }),
}));

jest.mock('../../models/tripModel', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('../../models/itineraryModel', () => ({
  bulkCreate: jest.fn(),
}));

jest.mock('../../models/citiesModel', () => ({
  findByPk: jest.fn().mockResolvedValue({ CityID: 1, CityName: 'Kandy' }),
}));

jest.mock('../../models/destinationModel', () => ({
  findByPk: jest.fn().mockResolvedValue({
    DestinationID: 1,
    DestinationName: 'Kandy Lake',
    Description: 'Situated in the city center of Kandy',
    Latitude: 48.8584,
    Longitude: 2.2945,
    Rating: 4.7,
    Image: 'http://awss3.com/kandy-lake.jpg',
  }),
}));

jest.mock('../../models/hotelAssignmentsModel', () => ({
  bulkCreate: jest.fn(),
}));

jest.mock('../../services/hotelService', () => ({
  getGooglePlaceDetails: jest.fn(),
}));

describe('Trip Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a trip', async () => {
    const mockTrip = {
      TripID: 1,
      CityID: 1,
      TripName: 'Trip to Kandy',
      StartDate: new Date(),
      EndDate: new Date(),
      Duration: 4,
      TravelerID: 1,
    };
    (Trip.create as jest.Mock).mockResolvedValue(mockTrip);

    const data = {
      CityID: 1,
      TripName: 'Trip to Kandy',
      StartDate: new Date('2024-09-01'),
      EndDate: new Date('2024-09-04'),
      TravelerID: 1,
      Itineraries: [],
      Accommodations: [],
    };

    const result = await createTrip(data);
    expect(result).toEqual(mockTrip);
    expect(Trip.create).toHaveBeenCalledWith(
      {
        CityID: 1,
        TripName: 'Trip to Kandy',
        StartDate: new Date('2024-09-01'),
        EndDate: new Date('2024-09-04'),
        Duration: 4,
        TravelerID: 1,
      },
      { transaction: expect.anything() }
    );
  });

  test('should get all trips for a traveler', async () => {
    const mockTrips = [{ TripID: 1, TripName: 'Trip to Kandy' }];
    (Trip.findAll as jest.Mock).mockResolvedValue(mockTrips);

    const travelerId = 1;
    const result = await getAllTrips(travelerId);

    expect(result).toEqual(mockTrips);
    expect(Trip.findAll).toHaveBeenCalledWith({
      where: { TravelerID: travelerId },
      include: [
        { model: City, as: 'city' },
        { model: Itinerary, as: 'itineraries', include: [{ model: Destination, as: 'destination' }] },
        { model: HotelAssign, as: 'hotelAssignments' },
      ],
    });
  });

  test('should get a trip by ID with grouped itineraries and accommodation details', async () => {
    const mockTrip = {
      TripID: 1,
      CityID: 1,
      TripName: 'Trip to Kandy',
      StartDate: new Date('2024-09-01'),
      EndDate: new Date('2024-09-04'),
      Duration: 4,
      TravelerID: 1,
      city: { CityID: 1, CityName: 'Kandy' },
      itineraries: [
        {
          DayNumber: 1,
          DestinationID: 1,
          OrderNumber: 1,
          TimeFrom: '10:00',
          TimeTo: '12:00',
          destination: {
            DestinationName: 'Kandy Lake',
            Description: 'Situated in the city center of Kandy',
            Latitude: 48.8584,
            Longitude: 2.2945,
            Ratings: 4.7,
            Image: 'http://awss3.com/kandy-lake.jpg',
          },
        },
      ],
      hotelAssignments: [
        {
          DayNumber: 1,
          HotelID: 'Xsdfsdfwrfdweggfvlcma',
        },
      ],
    };
    (Trip.findByPk as jest.Mock).mockResolvedValue(mockTrip);
    (getGooglePlaceDetails as jest.Mock).mockResolvedValue({
      Name: 'The Trees',
      Address: '23, Raja Vidiya, Kandy',
      Phone: '0329900333',
      Rating: 4.5,
    });

    const tripId = 1;
    const result = await getTripById(tripId);

    expect(result).toEqual({
      TripID: 1,
      CityID: 1,
      TripName: 'Trip to Kandy',
      StartDate: new Date('2024-09-01'),
      EndDate: new Date('2024-09-04'),
      Duration: 4,
      TravelerID: 1,
      City: mockTrip.city,
      Itineraries: [
        {
          DayNumber: 1,
          destinations: [
            {
              DestinationID: 1,
              OrderNumber: 1,
              DestinationName: 'Kandy Lake',
              Description: 'Situated in the city center of Kandy',
              Latitude: 48.8584,
              Longitude: 2.2945,
              Rating: 4.7,
              Image: 'http://awss3.com/kandy-lake.jpg',
              TimeFrom: '10:00',
              TimeTo: '12:00',
            },
          ],
        },
      ],
      Accommodations: [
        {
          day: 1,
          placeId: 'Xsdfsdfwrfdweggfvlcma',
          Name: 'The Trees',
          Address: '23, Raja Vidiya, Kandy',
          Phone: '0329900333',
          Rating: 4.5,
        },
      ],
    });
  });

  test('should delete a trip', async () => {
    const mockTrip = { destroy: jest.fn() };
    (Trip.findByPk as jest.Mock).mockResolvedValue(mockTrip as any);

    const tripId = 1;
    await deleteTrip(tripId);

    expect(Trip.findByPk).toHaveBeenCalledWith(tripId);
    expect(mockTrip.destroy).toHaveBeenCalled();
  });
});
