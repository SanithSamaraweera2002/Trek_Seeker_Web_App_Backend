import request from 'supertest';
import app from '../../index';
import sequelize from '../../config/database';
import User from '../../models/userModel';
import Trip from '../../models/tripModel';

describe('GET /api/admin/dashboard', () => {
  let token: string;

  beforeAll(async () => {
    await sequelize.authenticate();

    // const passwordHash = await bcrypt.hash('password123', 10);
    // const adminUser = await User.create({
    //   UserName: 'Admin Test User',
    //   FirstName: 'Admin',
    //   LastName: 'User',
    //   Email: `admintestuser${Date.now()}@gmail.com`,
    //   Password: passwordHash,
    //   Permission: 'admin',
    // });

    const loginResponse = await request(app).post('/api/login').send({
      Email: 'gimhanasandaruwan@gmail.com',
      Password: 'GimhanaTestNewPass@123',
    });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should return the correct dashboard statistics', async () => {
    const userCount = await User.count({ where: { Permission: 'traveler' } });
    const activeUserCount = await User.count({ where: { Permission: 'traveler', Status: 1 } });
    const inactiveUserCount = await User.count({ where: { Permission: 'traveler', Status: 0 } });
    const totalTrips = await Trip.count();

    const response = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalUsers', userCount);
    expect(response.body).toHaveProperty('activeUserCount', activeUserCount);
    expect(response.body).toHaveProperty('inactiveUserCount', inactiveUserCount);
    expect(response.body).toHaveProperty('totalTrips', totalTrips);

    expect(response.body.signUpsByMonth).toBeInstanceOf(Array);
    response.body.signUpsByMonth.forEach((monthData: any) => {
      expect(monthData).toHaveProperty('month');
      expect(monthData).toHaveProperty('count');
    });

    expect(response.body.usersByGender).toBeInstanceOf(Array);
    response.body.usersByGender.forEach((genderData: any) => {
      expect(genderData).toHaveProperty('Gender');
      expect(genderData).toHaveProperty('count');
    });

    expect(response.body.usersByCountry).toBeInstanceOf(Array);
    response.body.usersByCountry.forEach((countryData: any) => {
      expect(countryData).toHaveProperty('Country');
      expect(countryData).toHaveProperty('count');
    });

    expect(response.body).toHaveProperty('mostPopularCity');
    expect(response.body.mostPopularCity).toHaveProperty('CityID');
    expect(response.body.mostPopularCity).toHaveProperty('tripCount');
    expect(response.body.mostPopularCity.city).toHaveProperty('CityName');
  });

  it('should return 401 error when no token is provided', async () => {
    const response = await request(app).get('/api/admin/dashboard');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'No token provided');
  });
});
