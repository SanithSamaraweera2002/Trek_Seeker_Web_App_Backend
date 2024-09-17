import Destination from '../../models/destinationModel';
import City from '../../models/citiesModel';
import {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
} from '../../services/destinationService';

jest.mock('../../models/destinationModel');
jest.mock('../../models/citiesModel');

describe('Destination Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDestination', () => {
    it('should create a new destination', async () => {
      const destinationData = {
        DestinationName: 'New Destination Test Now',
        Description: 'Scenic View with Nature Vibes Exploration',
        CityID: 1,
        Latitude: 123.45,
        Longitude: 67.89,
        Ratings: 4.5,
        TimeSpent: 120,
      };

      (Destination.create as jest.Mock).mockResolvedValue(destinationData);

      const result = await createDestination(destinationData);

      expect(Destination.create).toHaveBeenCalledWith(destinationData);
      expect(result).toEqual(destinationData);
    });
  });

  describe('getAllDestinations', () => {
    it('should return all destinations', async () => {
      const mockDestinations = {
        count: 2,
        rows: [
          { DestinationName: 'Lotus Tower', CityID: 1 },
          { DestinationName: 'Kandy Lake', CityID: 2 },
        ],
      };

      (Destination.findAndCountAll as jest.Mock).mockResolvedValue(mockDestinations);

      const page = 1;
      const limit = 10;
      const result = await getAllDestinations(page, limit);

      expect(Destination.findAndCountAll).toHaveBeenCalledWith({
        limit,
        offset: 0,
        include: [
          {
            model: City,
            as: 'city',
            attributes: ['CityName'],
          },
        ],
      });
      expect(result).toEqual({ total: 2, destinations: mockDestinations.rows });
    });
  });

  describe('getDestinationById', () => {
    it('should return a destination by ID', async () => {
      const mockDestination = {
        DestinationName: 'Lotus Tower',
        CityID: 1,
        city: { CityName: 'City 1' },
      };

      (Destination.findByPk as jest.Mock).mockResolvedValue(mockDestination);

      const destinationId = 1;
      const result = await getDestinationById(destinationId);

      expect(Destination.findByPk).toHaveBeenCalledWith(destinationId, {
        include: [
          {
            model: City,
            as: 'city',
            attributes: ['CityName'],
          },
        ],
      });
      expect(result).toEqual(mockDestination);
    });

    it('should return null if destination not found', async () => {
      (Destination.findByPk as jest.Mock).mockResolvedValue(null);

      const destinationId = 1;
      const result = await getDestinationById(destinationId);

      expect(result).toBeNull();
    });
  });

  describe('updateDestination', () => {
    it('should update a destination if it exists', async () => {
      const destinationData = {
        DestinationName: 'Updated New Destination',
      };

      const mockDestination = {
        DestinationName: 'Old Destination',
        save: jest.fn().mockResolvedValue(destinationData),
      };

      (Destination.findByPk as jest.Mock).mockResolvedValue(mockDestination);

      const destinationId = 1;
      const result = await updateDestination(destinationId, destinationData);

      expect(Destination.findByPk).toHaveBeenCalledWith(destinationId);
      expect(mockDestination.save).toHaveBeenCalled();
      expect(result.DestinationName).toEqual('Updated New Destination');
    });

    it('should throw an error if destination not found', async () => {
      (Destination.findByPk as jest.Mock).mockResolvedValue(null);

      const destinationId = 1;
      const destinationData = { DestinationName: 'New Destination' };

      await expect(updateDestination(destinationId, destinationData)).rejects.toThrow('Destination not found');
    });
  });

  describe('deleteDestination', () => {
    it('should delete a destination if it exists', async () => {
      const mockDestination = {
        destroy: jest.fn().mockResolvedValue(true),
      };

      (Destination.findByPk as jest.Mock).mockResolvedValue(mockDestination);

      const destinationId = 139;
      await deleteDestination(destinationId);

      expect(Destination.findByPk).toHaveBeenCalledWith(destinationId);
      expect(mockDestination.destroy).toHaveBeenCalled();
    });

    it('should throw an error if destination not found', async () => {
      (Destination.findByPk as jest.Mock).mockResolvedValue(null);

      const destinationId = 1;

      await expect(deleteDestination(destinationId)).rejects.toThrow('Destination not found');
    });
  });
});
