import City from '../models/citiesModel';
import Destination from '../models/destinationModel';

// Create new city
export const createCity = async (data: {
  CityName: string;
  CityDescription?: string;
  CityLatitude?: number;
  CityLongitude?: number;
  CityImage?: string;
}) => {
  const { CityName, CityDescription, CityLatitude, CityLongitude, CityImage } = data;

  const existingCity = await City.findOne({ where: { CityName } });
  if (existingCity) {
    throw new Error('City already exists');
  }

  const newCity = await City.create({
    CityName,
    CityDescription,
    CityLatitude,
    CityLongitude,
    CityImage,
  });

  return newCity;
};

// Get all cities
export const getAllCities = async (limit: number, page: number) => {
  const offset = (page - 1) * limit;
  return await City.findAndCountAll({ limit, offset });
};

// Get a city by ID
export const getCityById = async (id: number) => {
  const city = await City.findByPk(id, {
    include: [
      {
        model: Destination,
        as: 'destinations',
        attributes: ['DestinationName', 'Description'],
      },
    ],
  });

  return city;
};

// Update city
export const updateCity = async (
  id: number,
  data: {
    CityName?: string;
    CityDescription?: string;
    CityLatitude?: number;
    CityLongitude?: number;
    CityImage?: string;
  }
) => {
  const { CityName, CityDescription, CityLatitude, CityLongitude, CityImage } = data;

  const city = await City.findByPk(id);
  if (!city) {
    throw new Error('City not found');
  }

  city.CityName = CityName ?? city.CityName;
  city.CityDescription = CityDescription ?? city.CityDescription;
  city.CityLatitude = CityLatitude ?? city.CityLatitude;
  city.CityLongitude = CityLongitude ?? city.CityLongitude;
  city.CityImage = CityImage ?? city.CityImage;

  await city.save();

  return city;
};

// Delete City (Soft)
export const deleteCity = async (id: number) => {
  const city = await City.findByPk(id);

  if (city) {
    await city.destroy();
  } else {
    throw new Error('City not found');
  }
};
