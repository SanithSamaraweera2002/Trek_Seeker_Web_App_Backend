import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../../services/userService';
import User from '../../models/userModel';
import TravelerDetail from '../../models/travelerDetailModel';
import bcrypt from 'bcrypt';
import { validateEmail } from '../../utils/validators';

jest.mock('../../models/userModel');
jest.mock('bcrypt');
jest.mock('../../utils/validators');

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const mockUser = {
      UserID: 1,
      UserName: 'Test Admin',
      Email: 'testadmin@gmail.com',
      Password: 'hashedpassword',
      Permission: 'admin',
      Status: 1,
      save: jest.fn(),
    };

    it('should create a new user if the email does not already exist', async () => {
      (validateEmail as jest.Mock).mockReturnValue(true);
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      const newUser = await createUser({
        FirstName: 'Test',
        LastName: 'Admin',
        Email: 'testadmin@gmail.com',
        Password: 'password',
        Permission: 'admin',
      });

      expect(validateEmail).toHaveBeenCalledWith('testadmin@gmail.com');
      expect(User.findOne).toHaveBeenCalledWith({ where: { Email: 'testadmin@gmail.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(User.create).toHaveBeenCalledWith({
        UserName: 'Test Admin',
        FirstName: 'Test',
        LastName: 'Admin',
        Email: 'testadmin@gmail.com',
        Password: 'hashedpassword',
        Permission: 'admin',
        Status: 1,
      });
      expect(newUser).toEqual(mockUser);
    });

    it('should throw an error if the email already exists', async () => {
      (validateEmail as jest.Mock).mockReturnValue(true);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        createUser({
          FirstName: 'Test',
          LastName: 'Admin',
          Email: 'testadmin@gmail.com',
          Password: 'password',
          Permission: 'admin',
        })
      ).rejects.toThrow('Email already exists');

      expect(validateEmail).toHaveBeenCalledWith('testadmin@gmail.com');
      expect(User.findOne).toHaveBeenCalledWith({ where: { Email: 'testadmin@gmail.com' } });
    });

    it('should throw an error if the email format is invalid', async () => {
      (validateEmail as jest.Mock).mockReturnValue(false);

      await expect(
        createUser({
          FirstName: 'Test',
          LastName: 'Admin',
          Email: 'invalid-email',
          Password: 'password',
          Permission: 'admin',
        })
      ).rejects.toThrow('Invalid email format');

      expect(validateEmail).toHaveBeenCalledWith('invalid-email');
      expect(User.findOne).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    const mockUsers = [
      { UserID: 1, UserName: 'Sanith Samaraweera', Email: 'sanithsamaraweera@gmail.com', Status: 1 },
      { UserID: 2, UserName: 'Malith Dhananjaya', Email: 'malithdhananjaya@gmail.com', Status: 1 },
    ];

    it('should return all users with status 1', async () => {
      (User.findAndCountAll as jest.Mock).mockResolvedValue({ count: 2, rows: mockUsers });

      const users = await getAllUsers(10, 1);
      expect(User.findAndCountAll).toHaveBeenCalledWith({ limit: 10, offset: 0 });
      expect(users).toEqual({ count: 2, rows: mockUsers });
    });

    it('should return an empty array if no users with status 1 exist', async () => {
      (User.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });

      const users = await getAllUsers(10, 1);
      expect(User.findAndCountAll).toHaveBeenCalledWith({ limit: 10, offset: 0 });
      expect(users).toEqual({ count: 0, rows: [] });
    });
  });

  describe('getUserById', () => {
    const mockUser = { UserID: 1, UserName: 'User Test', Email: 'testuser@gmail.com', Status: 1 };

    it('should return a user by ID', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const user = await getUserById(1);
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(user).toEqual(mockUser);
    });

    it('should return null if no user is found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const user = await getUserById(738);
      expect(User.findByPk).toHaveBeenCalledWith(738);
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    const mockUser = {
      UserID: 1,
      UserName: 'User One',
      Email: 'newemail@gmail.com',
      Password: 'hashedPassword',
      Permission: 'admin',
      Status: 1,
      save: jest.fn(),
    };

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should update user details', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      const updatedUser = await updateUser(1, { UserName: 'Updated User', Password: 'newPassword' });

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockUser.UserName).toBe('Updated User');
      expect(mockUser.Password).toBe('newHashedPassword');
      expect(mockUser.save).toHaveBeenCalled();
      expect(updatedUser).toEqual(mockUser);
    });

    it('should throw an error if user is not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(updateUser(999, { UserName: 'Updated User' })).rejects.toThrow('User not found');
    });

    it('should throw an error if email format is invalid', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (validateEmail as jest.Mock).mockReturnValue(false);

      await expect(updateUser(1, { Email: 'invalid-email' })).rejects.toThrow('Invalid email format');
    });

    it('should throw an error if email already exists', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (validateEmail as jest.Mock).mockReturnValue(true);
      (User.findOne as jest.Mock).mockResolvedValue({});

      await expect(updateUser(1, { Email: 'sanithjithnuka@gmail.com' })).rejects.toThrow('Email already exists');
    });

    it('should update only provided fields', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      const updatedUser = await updateUser(1, { UserName: 'Updated User', Status: 0 });

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(updatedUser.UserName).toBe('Updated User');
      expect(updatedUser.Status).toBe(0);
      expect(updatedUser.Email).toBe('newemail@gmail.com');
      expect(updatedUser.Permission).toBe('admin');
      expect(updatedUser.save).toHaveBeenCalled();
    });

    it('should update the email when provided', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      (validateEmail as jest.Mock).mockReturnValue(true);
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const updatedUser = await updateUser(1, { Email: 'newuser@gmail.com' });

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(updatedUser.Email).toBe('newuser@gmail.com');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should keep unchanged fields when updating', async () => {
      const mockUser = {
        UserID: 1,
        UserName: 'Old User',
        Email: 'olduser@gmail.com',
        Permission: 'admin',
        Status: 1,
        save: jest.fn(),
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      const updatedUser = await updateUser(1, { UserName: 'Updated User' });

      expect(updatedUser.UserName).toBe('Updated User');
      expect(updatedUser.Email).toBe('olduser@gmail.com');
      expect(updatedUser.Permission).toBe('admin');
      expect(updatedUser.Status).toBe(1);
    });
  });

  // describe('deleteUser', () => {
  //   it('should set the user status to 0 instead of deleting', async () => {
  //     const mockUser = { Status: 1, save: jest.fn() };
  //     (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

  //     await deleteUser(1);

  //     expect(User.findByPk).toHaveBeenCalledWith(1);
  //     expect(mockUser.Status).toBe(0);
  //     expect(mockUser.save).toHaveBeenCalled();
  //   });

  //   it('should throw an error if the user is not found', async () => {
  //     (User.findByPk as jest.Mock).mockResolvedValue(null);

  //     await expect(deleteUser(999)).rejects.toThrow('User not found');
  //   });
  // });

  describe('deleteUser', () => {
    it('should set the user status to 0 and update the associated traveler status to 0 if traveler exists', async () => {
      const mockTravelerDetail = { Status: 1, save: jest.fn() };
      const mockUser = { Status: 1, travelerDetail: mockTravelerDetail, save: jest.fn() };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (mockUser.save as jest.Mock).mockResolvedValue(mockUser);
      (mockTravelerDetail.save as jest.Mock).mockResolvedValue(mockTravelerDetail);

      await deleteUser(1);

      expect(User.findByPk).toHaveBeenCalledWith(1, { include: { as: 'travelerDetail', model: TravelerDetail } });
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockTravelerDetail.save).toHaveBeenCalled();
      expect(mockUser.Status).toBe(0);
      expect(mockTravelerDetail.Status).toBe(0);
    });

    it('should set the user status to 0 and handle the case with no associated traveler', async () => {
      const mockUser = { Status: 1, travelerDetail: null, save: jest.fn() };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (mockUser.save as jest.Mock).mockResolvedValue(mockUser);

      await deleteUser(1);

      expect(User.findByPk).toHaveBeenCalledWith(1, { include: { as: 'travelerDetail', model: TravelerDetail } });
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.Status).toBe(0);

      expect(mockUser.travelerDetail).toBeNull();
    });

    it('should throw an error if the user is not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(deleteUser(999)).rejects.toThrow('User not found');
    });

    it('should throw an error if the user is already inactive', async () => {
      const mockUser = { Status: 0 };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await expect(deleteUser(1)).rejects.toThrow('User not found');
    });
  });
});
