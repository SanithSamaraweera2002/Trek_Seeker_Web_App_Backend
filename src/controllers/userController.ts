import { Request, Response } from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../services/userService';

// Create new User
export const createUserController = async (req: Request, res: Response): Promise<void> => {
  const { FirstName, LastName, Email, Password, Permission } = req.body;

  try {
    const newUser = await createUser({ FirstName, LastName, Email, Password, Permission });
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get all users
export const getAllUsersController = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const page = parseInt(req.query.page as string, 10) || 1;

  try {
    // const users = await getAllUsers();
    const { rows: users, count } = await getAllUsers(limit, page);
    res.status(200).json({
      data: users,
      total: count,
      limit,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
export const getUserByIdController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await getUserById(Number(id));

    if (user && user.Status === 1) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
export const updateUserController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { UserName, FirstName, LastName, Email, Password, Permission, Status } = req.body;

  try {
    const updatedUser = await updateUser(Number(id), {
      UserName,
      FirstName,
      LastName,
      Email,
      Password,
      Permission,
      Status,
    });
    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user
export const deleteUserController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await deleteUser(Number(id));
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};
