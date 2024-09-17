import { Request, Response } from 'express';
import { generateTrip } from '../services/generateTripService';

export const generateTripController = async (req: Request, res: Response): Promise<void> => {
  try {
    const tripData = req.body;
    const result = await generateTrip(tripData);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
