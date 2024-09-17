import Destination from '../models/destinationModel';
import City from '../models/citiesModel';

interface CreateDestinationData {
  DestinationName: string;
  Description?: string;
  Image?: string;
  CityID: number;
  Latitude: number;
  Longitude: number;
  Ratings?: number;
  TimeSpent?: number;
}

// Create new destination
export const createDestination = async (data: CreateDestinationData) => {
  const { DestinationName, Description, Image, CityID, Latitude, Longitude, Ratings, TimeSpent } = data;

  const newDestination = await Destination.create({
    DestinationName,
    Description,
    Image,
    CityID,
    Latitude,
    Longitude,
    Ratings,
    TimeSpent,
  });

  return newDestination;
};

// Get all destinations with pagination
export const getAllDestinations = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await Destination.findAndCountAll({
    limit,
    offset,
    include: [
      {
        model: City,
        as: 'city',
        attributes: ['CityName'],
      },
    ],
  });

  return { total: count, destinations: rows };
};

// Get destination by ID
export const getDestinationById = async (id: number) => {
  return await Destination.findByPk(id, {
    include: [
      {
        model: City,
        as: 'city',
        attributes: ['CityName'],
      },
    ],
  });
};

// Update destination
export const updateDestination = async (
  id: number,
  data: {
    DestinationName?: string;
    Description?: string;
    Image?: string;
    CityID?: number;
    Latitude?: number;
    Longitude?: number;
    Ratings?: number;
    TimeSpent?: number;
  }
) => {
  const destination = await Destination.findByPk(id);
  if (!destination) {
    throw new Error('Destination not found');
  }

  destination.DestinationName = data.DestinationName ?? destination.DestinationName;
  destination.Description = data.Description ?? destination.Description;
  destination.Image = data.Image ?? destination.Image;
  destination.CityID = data.CityID ?? destination.CityID;
  destination.Latitude = data.Latitude ?? destination.Latitude;
  destination.Longitude = data.Longitude ?? destination.Longitude;
  destination.Ratings = data.Ratings ?? destination.Ratings;
  destination.TimeSpent = data.TimeSpent ?? destination.TimeSpent;

  await destination.save();
  return destination;
};

// Delete destination (Soft)
export const deleteDestination = async (id: number) => {
  const destination = await Destination.findByPk(id);
  if (!destination) {
    throw new Error('Destination not found');
  }

  await destination.destroy();
};
