import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from '../models/userModel';
import TravelerDetail from '../models/travelerDetailModel';
import { Op } from 'sequelize';

dotenv.config();

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET_KEY || '';

interface LoginResponse {
  token: string;
  role: string;
  username: string;
  firstname: string;
  email: string;
  id: number;
}

export const loginUser = async (Email: string, Password: string): Promise<LoginResponse> => {
  const user = await User.findOne({
    where: { Email },
    include: [
      {
        model: TravelerDetail,
        as: 'travelerDetail',
      },
    ],
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(Password, user.Password);

  if (!isMatch) {
    throw new Error('Invalid password');
  }

  const travelerId = user.Permission === 'traveler' ? user.travelerDetail?.TravelerID || null : null;
  const token = jwt.sign({ UserID: user.UserID, Role: user.Permission }, JWT_SECRET, { expiresIn: '6h' });

  return {
    token,
    role: user.Permission,
    username: user.UserName,
    firstname: user.FirstName,
    email: user.Email,
    id: user.Permission === 'traveler' ? travelerId || 0 : user.UserID,
  };
};

// Reset password token and email generation
export const sendPasswordResetEmail = async (Email: string): Promise<void> => {
  const user = await User.findOne({ where: { Email } });

  if (!user) {
    throw new Error('User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.ResetPasswordToken = hashedToken;
  user.ResetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'trekseeker.io@gmail.com',
      pass: 'wmqh ejdu ollg kohp',
    },
  });

  const mailOptions = {
    from: {
      name: 'Trek Seeker',
      address: 'trekseeker.io@gmail.com',
    },
    to: user.Email,
    subject: 'Account Password Reset',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p>Hello ${user.Email},</p>
      <p>We received a request to reset your password. Click the button below to create a new password. If you did not request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <div style="text-align: center; margin-top: 20px;">
          <a href="${resetURL}" style="display: inline-block; padding: 10px 18px; font-size: 16px; font-weight: bold; text-align: center; text-decoration: none; color: #fff; background-color: #007bff; border-radius: 5px;">Reset Password</a>
        </div>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br/>The Trek Seeker Team</p>
    </div>
  `,
  };

  await transporter.sendMail(mailOptions);
};

export const resetPassword = async (resetToken: string, newPassword: string): Promise<void> => {
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const nowUTC = new Date();

  // console.log('nowUTC ', nowUTC);

  const user = await User.findOne({
    where: {
      ResetPasswordToken: hashedToken,
      ResetPasswordExpires: { [Op.gt]: nowUTC },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired password reset token');
  }

  user.Password = await bcrypt.hash(newPassword, 10);
  user.ResetPasswordToken = null;
  user.ResetPasswordExpires = null;
  await user.save();
};
