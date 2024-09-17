import sequelize from '../config/database';
import Trip from '../models/tripModel';
import Itinerary from '../models/itineraryModel';
import City from '../models/citiesModel';
import Destination from '../models/destinationModel';
import HotelAssign from '../models/hotelAssignmentsModel';
import { getGooglePlaceDetails } from './hotelService';

// Create trip with itinerary
export const createTrip = async (data: {
  CityID: number;
  TripName?: string;
  StartDate: Date;
  EndDate: Date;
  TravelerID: number;
  Itineraries?: Array<{
    DayNumber: number;
    DestinationID: number;
    OrderNumber: number;
    TimeFrom: string;
    TimeTo: string;
  }>;
  Accommodations?: Array<{
    DayNumber: number;
    PlaceID: string;
  }>;
}) => {
  const { CityID, TripName, StartDate, EndDate, TravelerID, Itineraries, Accommodations } = data;

  const transaction = await sequelize.transaction();

  try {
    const duration = Math.ceil((EndDate.getTime() - StartDate.getTime()) / (1000 * 3600 * 24)) + 1;

    const trip = await Trip.create(
      {
        CityID,
        TripName,
        StartDate,
        EndDate,
        Duration: duration,
        TravelerID,
      },
      { transaction }
    );

    // Create itinerary
    if (Itineraries && Itineraries.length > 0) {
      const itineraryData = Itineraries.map((item) => ({
        TripID: trip.TripID,
        DayNumber: item.DayNumber,
        DestinationID: item.DestinationID,
        OrderNumber: item.OrderNumber,
        TimeFrom: item.TimeFrom,
        TimeTo: item.TimeTo,
      }));

      await Itinerary.bulkCreate(itineraryData, { transaction });
    }

    if (Accommodations && Accommodations.length > 0) {
      const accommodationsData = Accommodations.map((item) => ({
        TripID: trip.TripID,
        DayNumber: item.DayNumber,
        HotelID: item.PlaceID,
      }));

      await HotelAssign.bulkCreate(accommodationsData, { transaction });
    }

    await transaction.commit();

    return trip;
  } catch (error: any) {
    await transaction.rollback();
    throw new Error(error.message);
  }
};

// Get all trips
export const getAllTrips = async (travelerId: number) => {
  return await Trip.findAll({
    where: { TravelerID: travelerId },
    include: [
      { model: City, as: 'city' },
      { model: Itinerary, as: 'itineraries', include: [{ model: Destination, as: 'destination' }] },
      { model: HotelAssign, as: 'hotelAssignments' },
    ],
  });
};

// Get trip by ID - itinerary grouped by day
export const getTripById = async (id: number) => {
  const trip = (await Trip.findByPk(id, {
    include: [
      { model: City, as: 'city' },
      { model: Itinerary, as: 'itineraries', include: [{ model: Destination, as: 'destination' }] },
      { model: HotelAssign, as: 'hotelAssignments' },
    ],
  })) as Trip & { city: City; itineraries: Itinerary[]; hotelAssignments: HotelAssign[] };

  if (!trip) {
    return;
  }

  // console.log('TRIP', trip);

  // Get Real Time Accommodation Details
  const accommodationsDetails = trip.hotelAssignments
    ? await Promise.all(
        trip.hotelAssignments.map(async (hotelAssignment) => {
          const placeDetails = await getGooglePlaceDetails(hotelAssignment.HotelID);
          return {
            day: hotelAssignment.DayNumber,
            placeId: hotelAssignment.HotelID,
            ...placeDetails,
          };
        })
      )
    : [];

  // Grouping according to day
  const groupedItineraries = trip.itineraries.reduce((acc: any, itinerary: any) => {
    const { DayNumber, destination, DestinationID, OrderNumber, TimeFrom, TimeTo } = itinerary;

    if (!acc[DayNumber]) {
      acc[DayNumber] = {
        DayNumber: DayNumber,
        destinations: [],
      };
    }

    acc[DayNumber].destinations.push({
      DestinationID: DestinationID,
      OrderNumber: OrderNumber,
      DestinationName: destination.DestinationName,
      Description: destination.Description,
      Latitude: destination.Latitude,
      Longitude: destination.Longitude,
      Rating: destination.Ratings,
      Image: destination.Image,
      TimeFrom: TimeFrom,
      TimeTo: TimeTo,
    });

    return acc;
  }, {});

  // Convert to array
  const formattedItineraries = Object.values(groupedItineraries);

  return {
    TripID: trip.TripID,
    CityID: trip.CityID,
    TripName: trip.TripName,
    StartDate: trip.StartDate,
    EndDate: trip.EndDate,
    Duration: trip.Duration,
    TravelerID: trip.TravelerID,
    City: trip.city,
    Itineraries: formattedItineraries,
    Accommodations: accommodationsDetails,
  };
};

// Delete trip (Soft)
export const deleteTrip = async (id: number) => {
  const trip = await Trip.findByPk(id);

  if (trip) {
    await trip.destroy();
  } else {
    throw new Error('Trip not found');
  }
};
