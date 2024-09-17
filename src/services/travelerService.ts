import User from '../models/userModel';
import TravelerDetail from '../models/travelerDetailModel';
import bcrypt from 'bcrypt';
import { validateEmail } from '../utils/validators';

type Genders = 'male' | 'female' | 'other';

export const registerTraveler = async (data: {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
  Country?: string;
  Gender?: Genders;
}) => {
  const { FirstName, LastName, Email, Password, Country, Gender } = data;

  if (!validateEmail(Email)) {
    throw new Error('Invalid email format');
  }

  const existingUser = await User.findOne({ where: { Email } });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(Password, 10);
  const UserName = LastName ? `${FirstName} ${LastName}` : FirstName;

  //New user create
  const newUser = await User.create({
    UserName,
    FirstName,
    LastName,
    Email,
    Password: hashedPassword,
    Permission: 'traveler',
    Status: 1,
  });

  //Create traveler profile
  await TravelerDetail.create({
    UserID: newUser.UserID,
    FirstName,
    LastName,
    Country,
    Gender,
    Status: 1,
  });

  return newUser;
};

export const getAllTravelers = async (limit: number, page: number) => {
  const offset = (page - 1) * limit;
  return await TravelerDetail.findAndCountAll({
    where: { Status: 1 },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Email', 'UserName', 'Password'],
      },
    ],
    limit,
    offset,
  });
};

export const getAllTravelersList = async () => {
  return await TravelerDetail.findAll({
    where: { Status: 1 },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Email'],
      },
    ],
    attributes: ['TravelerID', 'FirstName', 'LastName', 'Country', 'Gender', 'Status', 'UserID'],
  });
};

export const getTravelerById = async (id: number) => {
  const traveler = await TravelerDetail.findOne({
    where: {
      TravelerID: id,
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
  if (!traveler) {
    throw new Error('Traveler not found');
  }
  return traveler;
};

export const updateTraveler = async (
  id: number,
  data: {
    FirstName?: string;
    LastName?: string;
    Email?: string;
    Password?: string;
    Country?: string;
    Gender?: Genders;
  }
) => {
  const { FirstName, LastName, Email, Password, Country, Gender } = data;

  const traveler = await TravelerDetail.findByPk(id);
  if (!traveler) {
    throw new Error('Traveler not found');
  }

  const user = await User.findByPk(traveler.UserID);
  if (!user) {
    throw new Error('User not found');
  }

  // Check duplicate emails
  if (Email && Email !== user.Email) {
    const existingUser = await User.findOne({ where: { Email } });
    if (existingUser) {
      throw new Error('Email already exists');
    }
  }

  // User update
  user.Email = Email ?? user.Email;
  if (Password) {
    user.Password = await bcrypt.hash(Password, 10);
  }

  user.FirstName = FirstName ?? user.FirstName;
  user.LastName = LastName ?? user.LastName;

  await user.save();

  // Traveler details update
  traveler.FirstName = FirstName ?? traveler.FirstName;
  traveler.LastName = LastName ?? traveler.LastName;
  traveler.Country = Country ?? traveler.Country;
  traveler.Gender = Gender ?? traveler.Gender;

  await traveler.save();

  return traveler;
};

export const deleteTraveler = async (id: string) => {
  const traveler = await TravelerDetail.findByPk(id);

  if (!traveler || traveler.Status === 0) {
    throw new Error('Traveler not found');
  }

  traveler.Status = 0;
  await traveler.save();

  // Set associated user status to inactive
  const user = await User.findByPk(traveler.UserID);
  if (user) {
    user.Status = 0;
    await user.save();
  }

  return { message: 'Traveler deleted successfully' };
};
