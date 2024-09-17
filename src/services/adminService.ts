import User from '../models/userModel';
import TravelerDetail from '../models/travelerDetailModel';
import City from '../models/citiesModel';
import Trip from '../models/tripModel';
import { Op, fn, col, literal } from 'sequelize';
import sequelize from '../config/database';

export const getDashboardStatistics = async () => {
  // Total Traveler Count
  const totalUsers = await User.count({ where: { Permission: 'traveler' } });

  // Active / Inactive Traveler Count
  const activeUserCount = await User.count({ where: { Status: 1, Permission: 'traveler' } });
  const inactiveUserCount = await User.count({ where: { Status: 0, Permission: 'traveler' } });

  // Sign-ups stats
  const signUpsByMonth = await User.findAll({
    where: { Permission: 'traveler' },
    attributes: [
      [sequelize.fn('DATE_FORMAT', sequelize.col('CreatedAt'), '%Y-%m'), 'month'],
      [sequelize.fn('COUNT', sequelize.col('UserID')), 'count'],
    ],
    group: ['month'],
    order: [[sequelize.fn('DATE_FORMAT', sequelize.col('CreatedAt'), '%Y-%m'), 'ASC']],
  });

  // Users by gender
  const usersByGender = await TravelerDetail.findAll({
    attributes: [
      [
        literal(`CASE 
        WHEN Gender IS NULL OR Gender NOT IN ('male', 'female', 'other') THEN 'Unspecified'
        ELSE CONCAT(UPPER(SUBSTRING(Gender, 1, 1)), LOWER(SUBSTRING(Gender, 2)))
      END`),
        'Gender',
      ],
      [fn('COUNT', col('TravelerID')), 'count'],
    ],
    group: ['Gender'],
  });

  // Users by country
  const usersByCountry = await TravelerDetail.findAll({
    attributes: ['Country', [sequelize.fn('COUNT', sequelize.col('TravelerID')), 'count']],
    group: ['Country'],
  });

  // Total trips
  const totalTrips = await Trip.count();

  const mostPopularCity = (await Trip.findOne({
    attributes: ['CityID', [sequelize.fn('COUNT', sequelize.col('TripID')), 'tripCount']],
    group: ['CityID'],
    order: [[sequelize.fn('COUNT', sequelize.col('TripID')), 'DESC']],
    include: [
      {
        model: City,
        attributes: ['CityName'],
        as: 'city',
      },
    ],
  })) as unknown as {
    CityID: number;
    tripCount: number;
    city: {
      CityName: string;
    };
  };

  return {
    totalUsers,
    activeUserCount,
    inactiveUserCount,
    signUpsByMonth,
    usersByGender,
    usersByCountry,
    totalTrips,
    mostPopularCity,
  };
};
