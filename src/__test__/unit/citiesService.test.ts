import City from '../../models/citiesModel';
import Destination from '../../models/destinationModel';
import { createCity, getAllCities, getCityById, updateCity, deleteCity } from '../../services/citiesService';

jest.mock('../../models/citiesModel');
jest.mock('../../models/destinationModel');

describe('City Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCity', () => {
    it('should create a new city if it does not already exist', async () => {
      const cityData = {
        CityName: 'Rathnapura',
        CityDescription: 'Gem City of Sri Lanka',
        CityLatitude: 123.45,
        CityLongitude: 67.89,
      };

      (City.findOne as jest.Mock).mockResolvedValue(null);
      (City.create as jest.Mock).mockResolvedValue(cityData);

      const result = await createCity(cityData);

      expect(City.findOne).toHaveBeenCalledWith({ where: { CityName: 'Rathnapura' } });
      expect(City.create).toHaveBeenCalledWith(cityData);
      expect(result).toEqual(cityData);
    });

    it('should throw an error if the city already exists', async () => {
      const cityData = {
        CityName: 'Kandy',
      };

      (City.findOne as jest.Mock).mockResolvedValue(cityData);

      await expect(createCity(cityData)).rejects.toThrow('City already exists');
    });
  });

  describe('getAllCities', () => {
    it('should return all cities', async () => {
      const mockCities = {
        count: 10,
        rows: [{ CityName: 'Kandy' }, { CityName: 'Colombo' }],
      };

      (City.findAndCountAll as jest.Mock).mockResolvedValue(mockCities);

      const limit = 5;
      const page = 1;
      const result = await getAllCities(limit, page);

      expect(City.findAndCountAll).toHaveBeenCalledWith({ limit, offset: 0 });
      expect(result).toEqual(mockCities);
    });
  });

  describe('getCityById', () => {
    it('should return a city with its destinations', async () => {
      const mockCity = {
        CityName: 'Kandy',
        destinations: [{ DestinationName: 'Kandy Lake', Description: 'Situated In the Middle of Kandy' }],
      };

      (City.findByPk as jest.Mock).mockResolvedValue(mockCity);

      const cityId = 1;
      const result = await getCityById(cityId);

      expect(City.findByPk).toHaveBeenCalledWith(cityId, {
        include: [
          {
            model: Destination,
            as: 'destinations',
            attributes: ['DestinationName', 'Description'],
          },
        ],
      });
      expect(result).toEqual(mockCity);
    });

    it('should return null if city not found', async () => {
      (City.findByPk as jest.Mock).mockResolvedValue(null);

      const cityId = 1;
      const result = await getCityById(cityId);

      expect(result).toBeNull();
    });
  });

  describe('updateCity', () => {
    it('should update a city if it exists', async () => {
      const cityData = {
        CityName: 'Updated Kandy',
      };

      const mockCity = {
        CityName: 'Old Kandy',
        save: jest.fn().mockResolvedValue(cityData),
      };

      (City.findByPk as jest.Mock).mockResolvedValue(mockCity);

      const cityId = 1;
      const result = await updateCity(cityId, cityData);

      expect(City.findByPk).toHaveBeenCalledWith(cityId);
      expect(mockCity.save).toHaveBeenCalled();
      expect(result.CityName).toEqual('Updated Kandy');
    });

    it('should throw an error if city not found', async () => {
      (City.findByPk as jest.Mock).mockResolvedValue(null);

      const cityId = 1;
      const cityData = { CityName: 'Rathnapura' };

      await expect(updateCity(cityId, cityData)).rejects.toThrow('City not found');
    });
  });

  describe('deleteCity', () => {
    it('should delete a city if it exists', async () => {
      const mockCity = {
        destroy: jest.fn().mockResolvedValue(true),
      };

      (City.findByPk as jest.Mock).mockResolvedValue(mockCity);

      const cityId = 1;
      await deleteCity(cityId);

      expect(City.findByPk).toHaveBeenCalledWith(cityId);
      expect(mockCity.destroy).toHaveBeenCalled();
    });

    it('should throw an error if city not found', async () => {
      (City.findByPk as jest.Mock).mockResolvedValue(null);

      const cityId = 1;

      await expect(deleteCity(cityId)).rejects.toThrow('City not found');
    });
  });
});
