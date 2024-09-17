import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { loginUser } from '../../services/authService';
import User from '../../models/userModel';
import TravelerDetail from '../../models/travelerDetailModel';

jest.mock('../../models/userModel');
jest.mock('../../models/travelerDetailModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('loginUser', () => {
  const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a token and user details for a valid traveler login', async () => {
    const mockUser = {
      UserID: 1,
      Email: 'sanithjithnukatraveler@gmail.com',
      Password: 'hashedpassword',
      Permission: 'traveler',
      UserName: 'travelerUser',
      FirstName: 'Traveler',
      travelerDetail: {
        TravelerID: 12345,
      },
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('mockToken');

    const result = await loginUser('sanithjithnukatraveler@gmail.com', 'password123');

    expect(User.findOne).toHaveBeenCalledWith({
      where: { Email: 'sanithjithnukatraveler@gmail.com' },
      include: [{ model: TravelerDetail, as: 'travelerDetail' }],
    });

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
    expect(jwt.sign).toHaveBeenCalledWith({ UserID: 1, Role: 'traveler' }, JWT_SECRET, { expiresIn: '6h' });

    expect(result).toEqual({
      token: 'mockToken',
      role: 'traveler',
      username: 'travelerUser',
      firstname: 'Traveler',
      email: 'sanithjithnukatraveler@gmail.com',
      id: 12345,
    });
  });

  it('should return a token and user details for a valid admin login', async () => {
    const mockUser = {
      UserID: 2,
      Email: 'trekseekeradmin@gmail.com',
      Password: 'hashedpassword',
      Permission: 'admin',
      UserName: 'adminUser',
      FirstName: 'Admin',
      travelerDetail: null,
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('mockToken');

    const result = await loginUser('trekseekeradmin@gmail.com', 'password123');

    expect(User.findOne).toHaveBeenCalledWith({
      where: { Email: 'trekseekeradmin@gmail.com' },
      include: [{ model: TravelerDetail, as: 'travelerDetail' }],
    });

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
    expect(jwt.sign).toHaveBeenCalledWith({ UserID: 2, Role: 'admin' }, JWT_SECRET, { expiresIn: '6h' });

    expect(result).toEqual({
      token: 'mockToken',
      role: 'admin',
      username: 'adminUser',
      firstname: 'Admin',
      email: 'trekseekeradmin@gmail.com',
      id: 2,
    });
  });

  it('should throw an error if the user is not found', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    await expect(loginUser('nouser@gmail.com', 'password123')).rejects.toThrow('User not found');

    expect(User.findOne).toHaveBeenCalledWith({
      where: { Email: 'nouser@gmail.com' },
      include: [{ model: TravelerDetail, as: 'travelerDetail' }],
    });
  });

  it('should throw an error if the password is invalid', async () => {
    const mockUser = {
      UserID: 3,
      Email: 'trekseekeradmin@gmail.com',
      Password: 'hashedpassword',
      Permission: 'admin',
      UserName: 'adminUser',
      FirstName: 'Admin',
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(loginUser('trekseekeradmin@gmail.com', 'wrongpassword')).rejects.toThrow('Invalid password');

    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
  });
});
