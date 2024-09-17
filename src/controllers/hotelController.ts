import { Request, Response } from 'express';
import { getHotelRecommendations } from '../services/hotelService';

export const getHotelsForMultipleDaysController = async (req: Request, res: Response) => {
  const { destinations } = req.body;

  if (
    !Array.isArray(destinations) ||
    destinations.some(
      (dest) => typeof dest.latitude !== 'number' || typeof dest.longitude !== 'number' || typeof dest.day !== 'number'
    )
  ) {
    return res.status(400).json({
      message: 'Invalid input data',
    });
  }

  try {
    const recommendations = await getHotelRecommendations(destinations);

    res.status(200).json({
      recommendations,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching hotels',
      error: error.message,
    });
  }
};
