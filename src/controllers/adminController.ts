import { Request, Response } from 'express';
import { getDashboardStatistics } from '../services/adminService';

// Get dashboard statistics
export const getDashboardStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getDashboardStatistics();
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
