import User from './userModel';
import TravelerDetail from './travelerDetailModel';
import City from './citiesModel';
import Destination from './destinationModel';
import Trip from './tripModel';
import Itinerary from './itineraryModel';
import HotelAssign from './hotelAssignmentsModel';

export const associateModels = () => {
  //User Traveler Associations
  User.hasOne(TravelerDetail, {
    foreignKey: 'UserID',
    as: 'travelerDetail',
  });
  TravelerDetail.belongsTo(User, {
    foreignKey: 'UserID',
    as: 'user',
  });

  //City Destination Associations
  City.hasMany(Destination, {
    foreignKey: 'CityID',
    as: 'destinations',
  });
  Destination.belongsTo(City, {
    foreignKey: 'CityID',
    as: 'city',
  });

  // Trip Itinerary Destination Associations
  Trip.hasMany(Itinerary, {
    foreignKey: 'TripID',
    as: 'itineraries',
  });
  Itinerary.belongsTo(Trip, {
    foreignKey: 'TripID',
    as: 'trip',
  });
  Destination.hasMany(Itinerary, {
    foreignKey: 'DestinationID',
    as: 'itineraries',
  });
  Itinerary.belongsTo(Destination, {
    foreignKey: 'DestinationID',
    as: 'destination',
  });

  // Trip City Traveler Associations
  TravelerDetail.hasMany(Trip, {
    foreignKey: 'TravelerID',
    as: 'trips',
  });
  Trip.belongsTo(TravelerDetail, {
    foreignKey: 'TravelerID',
    as: 'traveler',
  });
  City.hasMany(Trip, {
    foreignKey: 'CityID',
    as: 'trips',
  });
  Trip.belongsTo(City, {
    foreignKey: 'CityID',
    as: 'city',
  });

  // Trip Hotel Associations
  Trip.hasMany(HotelAssign, {
    foreignKey: 'TripID',
    as: 'hotelAssignments',
  });
  HotelAssign.belongsTo(Trip, {
    foreignKey: 'TripID',
    as: 'trip',
  });
};
