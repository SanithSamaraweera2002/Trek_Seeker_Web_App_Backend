import { Request, Response } from 'express';
import { createCity, getAllCities, getCityById, updateCity, deleteCity } from '../services/citiesService';

// Create new city
export const createCityController = async (req: Request, res: Response): Promise<void> => {
  try {
    const newCity = await createCity(req.body);
    res.status(201).json({ message: 'City created successfully', city: newCity });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get all cities
export const getAllCitiesController = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const page = parseInt(req.query.page as string, 10) || 1;

  try {
    // const cities = await getAllCities()
    const { rows: cities, count } = await getAllCities(limit, page);
    res.status(200).json({
      data: cities,
      total: count,
      limit,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get city by ID
export const getCityByIdController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const city = await getCityById(Number(id));
    if (city) {
      res.status(200).json(city);
    } else {
      res.status(404).json({ message: 'City not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update city
export const updateCityController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { CityName, CityDescription, CityLatitude, CityLongitude, CityImage } = req.body;

  try {
    const updatedCity = await updateCity(Number(id), {
      CityName,
      CityDescription,
      CityLatitude,
      CityLongitude,
      CityImage,
    });
    res.status(200).json({ message: 'City updated successfully', city: updatedCity });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete city
export const deleteCityController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await deleteCity(Number(id));
    res.status(200).json({ message: 'City deleted successfully' });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};
