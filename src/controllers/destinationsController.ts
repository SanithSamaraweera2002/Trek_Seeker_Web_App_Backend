import { Request, Response } from 'express';
import {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
} from '../services/destinationService';

// Create new destination
export const createDestinationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const newDestination = await createDestination(req.body);
    res.status(201).json({ message: 'Destination created successfully', destination: newDestination });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get all destinations with pagination
export const getAllDestinationsController = async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const { total, destinations } = await getAllDestinations(Number(page), Number(limit));
    res.status(200).json({ total, data: destinations, page, totalPages: Math.ceil(total / Number(limit)) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get destination by ID
export const getDestinationByIdController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const destination = await getDestinationById(Number(id));
    if (destination) {
      res.status(200).json(destination);
    } else {
      res.status(404).json({ message: 'Destination not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update destination
export const updateDestinationController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedDestination = await updateDestination(Number(id), updateData);
    res.status(200).json({ message: 'Destination updated successfully', destination: updatedDestination });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete destination
export const deleteDestinationController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await deleteDestination(Number(id));
    res.status(200).json({ message: 'Destination deleted successfully' });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};
