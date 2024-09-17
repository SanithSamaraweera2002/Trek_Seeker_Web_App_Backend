import { Request, Response } from 'express';
import { loginUser, sendPasswordResetEmail, resetPassword } from '../services/authService';

export const loginUserController = async (req: Request, res: Response): Promise<void> => {
  const { Email, Password } = req.body;

  try {
    const { token, role, username, email, firstname, id } = await loginUser(Email, Password);
    res.status(200).json({ token, role, username, email, firstname, id });
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: 'User not found' });
    } else if (error.message === 'Invalid password') {
      res.status(401).json({ message: 'Invalid password' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

export const sendPasswordResetController = async (req: Request, res: Response): Promise<void> => {
  const { Email } = req.body;

  try {
    await sendPasswordResetEmail(Email);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(500).json({ message: 'Something went wrong, please try again' });
    }
  }
};

export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  const { resetToken, newPassword } = req.body;

  try {
    await resetPassword(resetToken, newPassword);
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error: any) {
    if (error.message === 'Invalid or expired password reset token') {
      res.status(400).json({ message: 'Invalid or expired password reset token' });
    } else {
      res.status(500).json({ message: 'Something went wrong, please try again' });
    }
  }
};
