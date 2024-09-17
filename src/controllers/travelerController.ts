import { Request, Response } from 'express';
import * as travelerService from '../services/travelerService';

// Traveler registration
export const registerTravelerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const newUser = await travelerService.registerTraveler(req.body);
    res.status(201).json({ message: 'Traveler registered successfully', user: newUser });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get all travelers
export const getAllTravelersController = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const page = parseInt(req.query.page as string, 10) || 1;

  try {
    // const travelers = await travelerService.getAllTravelers();
    const { rows: travelers, count } = await travelerService.getAllTravelers(limit, page);
    res.status(200).json({
      data: travelers,
      total: count,
      limit,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all travelers without pagination
export const getAllTravelersListController = async (req: Request, res: Response): Promise<void> => {
  try {
    const travelers = await travelerService.getAllTravelersList();
    res.status(200).json(travelers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get traveler by ID
export const getTravelerByIdController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const traveler = await travelerService.getTravelerById(Number(id));
    res.status(200).json(traveler);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

// Update traveler
export const updateTravelerController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const updatedTraveler = await travelerService.updateTraveler(Number(id), req.body);
    res.status(200).json({ message: 'Traveler profile updated successfully', traveler: updatedTraveler });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete traveler
export const deleteTravelerController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await travelerService.deleteTraveler(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};
