import {
  registerTraveler,
  getAllTravelers,
  getTravelerById,
  updateTraveler,
  deleteTraveler,
} from '../../services/travelerService';
import User from '../../models/userModel';
import TravelerDetail from '../../models/travelerDetailModel';
import bcrypt from 'bcrypt';

type Genders = 'male' | 'female' | 'other';

jest.mock('../../models/userModel');
jest.mock('../../models/travelerDetailModel');
jest.mock('bcrypt');

const mockHash = 'hashed_password';

const mockUser = {
  UserID: 1,
  UserName: 'Kaushalya Prasadhi',
  FirstName: 'Kaushalya',
  LastName: 'Prasadhi',
  Email: 'kaushiwe@gmail.com',
  Password: mockHash,
  Permission: 'traveler',
  Status: 1,
  save: jest.fn(),
};

const mockTravelerDetail = {
  UserID: 1,
  FirstName: 'Kaushi',
  LastName: 'Prasadhi',
  Country: 'UK',
  Gender: 'female',
  Status: 1,
  save: jest.fn(),
};

const mockTravelerDetailId = {
  UserID: 84,
  FirstName: 'Ravindu',
  LastName: 'Manuka',
  Country: 'Sri Lanka',
  Gender: 'male',
  Status: 1,
  save: jest.fn(),
};

describe('Traveler Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerTraveler', () => {
    it('should register a new traveler successfully', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (TravelerDetail.create as jest.Mock).mockResolvedValue(mockTravelerDetail);

      const travelerData = {
        FirstName: 'Kaushi',
        LastName: 'Prasadhi',
        Email: 'kaushiwe@gmail.com',
        Password: 'password123',
        Country: 'UK',
        Gender: 'female' as Genders,
      };

      const result = await registerTraveler(travelerData);

      expect(User.findOne).toHaveBeenCalledWith({ where: { Email: 'kaushiwe@gmail.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalledWith({
        UserName: 'Kaushi Prasadhi',
        FirstName: 'Kaushi',
        LastName: 'Prasadhi',
        Email: 'kaushiwe@gmail.com',
        Password: mockHash,
        Permission: 'traveler',
        Status: 1,
      });
      expect(TravelerDetail.create).toHaveBeenCalledWith({
        UserID: 1,
        FirstName: 'Kaushi',
        LastName: 'Prasadhi',
        Country: 'UK',
        Gender: 'female',
        Status: 1,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if the email already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const travelerData = {
        FirstName: 'Kaushi',
        LastName: 'Prasadhi',
        Email: 'kaushiwe@gmail.com',
        Password: 'password123',
        Country: 'UK',
        Gender: 'female' as Genders,
      };

      await expect(registerTraveler(travelerData)).rejects.toThrow('Email already exists');
    });
  });

  describe('getAllTravelers', () => {
    it('should return all travelers with pagination', async () => {
      (TravelerDetail.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: [mockTravelerDetail],
      });

      const result = await getAllTravelers(10, 1);

      expect(TravelerDetail.findAndCountAll).toHaveBeenCalledWith({
        where: { Status: 1 },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['Email', 'UserName', 'Password'],
          },
        ],
        limit: 10,
        offset: 0,
      });
      expect(result).toEqual({
        count: 1,
        rows: [mockTravelerDetail],
      });
    });
  });

  describe('getTravelerById', () => {
    it('should return traveler details by ID', async () => {
      (TravelerDetail.findOne as jest.Mock).mockResolvedValue(mockTravelerDetailId);

      const result = await getTravelerById(84);

      expect(TravelerDetail.findOne).toHaveBeenCalledWith({
        where: {
          TravelerID: 84,
          Status: 1,
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['Email', 'UserName', 'Password'],
          },
        ],
      });
      expect(result).toEqual(mockTravelerDetailId);
    });

    it('should throw an error if the traveler is not found', async () => {
      (TravelerDetail.findOne as jest.Mock).mockResolvedValue(null);

      await expect(getTravelerById(84)).rejects.toThrow('Traveler not found');
    });
  });

  describe('updateTraveler', () => {
    it('should update traveler details successfully', async () => {
      (TravelerDetail.findByPk as jest.Mock).mockResolvedValue(mockTravelerDetail);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);
      (mockUser.save as jest.Mock).mockResolvedValue(mockUser);
      (mockTravelerDetail.save as jest.Mock).mockResolvedValue(mockTravelerDetail);

      const updateData = {
        FirstName: 'Kaushalya',
        LastName: 'Weerasinghe',
        Email: 'kaushalyaprasadhi@gmail.com',
        Password: 'newpassword123',
        Country: 'USA',
        Gender: 'female' as Genders,
      };

      const result = await updateTraveler(1, updateData);

      expect(TravelerDetail.findByPk).toHaveBeenCalledWith(1);
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(User.findOne).toHaveBeenCalledWith({ where: { Email: 'kaushalyaprasadhi@gmail.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockTravelerDetail.save).toHaveBeenCalled();
      expect(result).toEqual(mockTravelerDetail);
    });

    it('should throw an error if the traveler is not found', async () => {
      (TravelerDetail.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(updateTraveler(1, {})).rejects.toThrow('Traveler not found');
    });

    it('should throw an error if the user is not found', async () => {
      (TravelerDetail.findByPk as jest.Mock).mockResolvedValue(mockTravelerDetail);
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(updateTraveler(1, {})).rejects.toThrow('User not found');
    });

    it('should throw an error if the email already exists', async () => {
      (TravelerDetail.findByPk as jest.Mock).mockResolvedValue(mockTravelerDetail);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(updateTraveler(1, { Email: 'kaushiwe@gmail.com' })).rejects.toThrow('Email already exists');
    });
  });

  describe('deleteTraveler', () => {
    it('should delete a traveler successfully and update the user status to inactive', async () => {
      const mockTravelerDetail = { UserID: 1, Status: 1, save: jest.fn() };
      const mockUser = { Status: 1, save: jest.fn() };

      (TravelerDetail.findByPk as jest.Mock).mockResolvedValue(mockTravelerDetail);
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (mockTravelerDetail.save as jest.Mock).mockResolvedValue(mockTravelerDetail);
      (mockUser.save as jest.Mock).mockResolvedValue(mockUser);

      const result = await deleteTraveler('1');

      expect(TravelerDetail.findByPk).toHaveBeenCalledWith('1');
      expect(User.findByPk).toHaveBeenCalledWith(mockTravelerDetail.UserID);
      expect(mockTravelerDetail.save).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Traveler deleted successfully' });

      expect(mockTravelerDetail.Status).toBe(0);
      expect(mockUser.Status).toBe(0);
    });

    it('should throw an error if the traveler is not found', async () => {
      (TravelerDetail.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(deleteTraveler('1')).rejects.toThrow('Traveler not found');
    });

    it('should throw an error if the traveler is already inactive', async () => {
      const mockTravelerDetail = { UserID: 1, Status: 0 };

      (TravelerDetail.findByPk as jest.Mock).mockResolvedValue(mockTravelerDetail);

      await expect(deleteTraveler('1')).rejects.toThrow('Traveler not found');
    });

    it('should handle the case where the user is not found', async () => {
      const mockTravelerDetail = { UserID: 1, Status: 1, save: jest.fn() };

      (TravelerDetail.findByPk as jest.Mock).mockResolvedValue(mockTravelerDetail);
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      (mockTravelerDetail.save as jest.Mock).mockResolvedValue(mockTravelerDetail);

      const result = await deleteTraveler('1');

      expect(TravelerDetail.findByPk).toHaveBeenCalledWith('1');
      expect(User.findByPk).toHaveBeenCalledWith(mockTravelerDetail.UserID);
      expect(mockTravelerDetail.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Traveler deleted successfully' });

      expect(mockTravelerDetail.Status).toBe(0);
    });
  });
});
