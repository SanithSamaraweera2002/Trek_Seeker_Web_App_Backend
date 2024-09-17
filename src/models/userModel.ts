import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import TravelerDetail from './travelerDetailModel';

//user interface
interface UserAttributes {
  UserID: number;
  UserName: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
  Permission: 'admin' | 'traveler';
  Status: number;
  ResetPasswordToken?: string | null;
  ResetPasswordExpires?: Date | null;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'UserID' | 'Permission' | 'Status'> {}

// user model
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public UserID!: number;
  public UserName!: string;
  public FirstName!: string;
  public LastName!: string;
  public Email!: string;
  public Password!: string;
  public Permission!: 'admin' | 'traveler';
  public Status!: number;
  public ResetPasswordToken?: string | null;
  public ResetPasswordExpires?: Date | null;
  public readonly CreatedAt?: Date;
  public readonly UpdatedAt?: Date;

  public travelerDetail?: TravelerDetail;
}

// Initialize
User.init(
  {
    UserID: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    UserName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    FirstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    LastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    Password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Permission: {
      type: DataTypes.ENUM('admin', 'traveler'),
      allowNull: false,
    },
    Status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    ResetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ResetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt',
  }
);

export default User;
