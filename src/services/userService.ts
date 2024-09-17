import User from '../models/userModel';
import TravelerDetail from '../models/travelerDetailModel';
import bcrypt from 'bcrypt';
import { validateEmail } from '../utils/validators';

// Create new User
export const createUser = async (data: {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
  Permission: 'admin' | 'traveler';
}) => {
  const { FirstName, LastName, Email, Password, Permission } = data;

  if (!validateEmail(Email)) {
    throw new Error('Invalid email format');
  }

  const existingUser = await User.findOne({ where: { Email } });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(Password, 10);
  const UserName = `${FirstName} ${LastName}`;

  return await User.create({ UserName, FirstName, LastName, Email, Password: hashedPassword, Permission, Status: 1 });
};

// Get all users
export const getAllUsers = async (limit: number, page: number) => {
  const offset = (page - 1) * limit;
  // return await User.findAndCountAll({ where: { Status: 1 }, limit, offset });
  return await User.findAndCountAll({ limit, offset });
};

// Get user by ID
export const getUserById = async (id: number) => {
  return await User.findByPk(id);
};

// Update user
export const updateUser = async (
  id: number,
  data: {
    UserName?: string;
    FirstName?: string;
    LastName?: string;
    Email?: string;
    Password?: string;
    Permission?: 'admin' | 'traveler';
    Status?: number;
  }
) => {
  const { UserName, Email, Password, Permission, Status, FirstName, LastName } = data;

  const user = await User.findByPk(id);
  if (!user) {
    throw new Error('User not found');
  }

  if (Email && Email !== user.Email) {
    if (!validateEmail(Email)) {
      throw new Error('Invalid email format');
    }

    const existingUser = await User.findOne({ where: { Email } });
    if (existingUser) {
      throw new Error('Email already exists');
    }
  }

  if (Password) {
    user.Password = await bcrypt.hash(Password, 10);
  }

  user.UserName = UserName ?? user.UserName;
  user.FirstName = FirstName ?? user.FirstName;
  user.LastName = LastName ?? user.LastName;
  user.Email = Email ?? user.Email;
  user.Permission = Permission ?? user.Permission;
  user.Status = Status ?? user.Status;

  await user.save();
  return user;
};

export const deleteUser = async (id: number) => {
  // Find the user by ID
  const user = await User.findByPk(id, {
    include: { model: TravelerDetail, as: 'travelerDetail' },
  });

  if (!user || user.Status === 0) {
    throw new Error('User not found');
  }

  // Update user status to inactive
  user.Status = 0;
  await user.save();

  // If traveler set traveler status to inactive
  if (user.travelerDetail) {
    user.travelerDetail.Status = 0;
    await user.travelerDetail.save();
  }
};
