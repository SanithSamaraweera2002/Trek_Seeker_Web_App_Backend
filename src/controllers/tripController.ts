import { Request, Response } from 'express';
import { createTrip, getAllTrips, getTripById, deleteTrip } from '../services/tripService';
import TravelerDetail from '../models/travelerDetailModel';

// Create trip with itinerary
export const createTripController = async (req: Request, res: Response): Promise<void> => {
  const { CityID, TripName, StartDate, EndDate, TravelerID, Itineraries, Accommodations } = req.body;

  try {
    const trip = await createTrip({
      CityID,
      TripName,
      StartDate: new Date(StartDate),
      EndDate: new Date(EndDate),
      TravelerID,
      Itineraries,
      Accommodations,
    });

    res.status(201).json({ message: 'Trip created successfully', trip });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all trips
export const getAllTripsController = async (req: Request, res: Response): Promise<void> => {
  const { travelerId } = req.params;

  try {
    const traveler = await TravelerDetail.findByPk(Number(travelerId));
    if (!traveler) {
      res.status(404).json({ message: 'Traveler not found' });
      return;
    }

    const trips = await getAllTrips(Number(travelerId));

    // if (trips.length === 0) {
    //   res.status(404).json({ message: 'No trips found' });
    //   return;
    // }

    res.status(200).json(trips);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get trip by ID
export const getTripByIdController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const trip = await getTripById(Number(id));

    if (trip) {
      res.status(200).json(trip);
    } else {
      res.status(404).json({ message: 'Trip not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete trip (Soft)
export const deleteTripController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await deleteTrip(Number(id));
    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};
