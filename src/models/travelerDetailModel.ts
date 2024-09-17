import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

//travelerDetail interface
interface TravelerDetailAttributes {
  TravelerID: number;
  FirstName: string;
  LastName?: string;
  Country?: string;
  Gender?: 'male' | 'female' | 'other';
  Status: number;
  UserID: number;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

interface TravelerCreationAttributes
  extends Optional<TravelerDetailAttributes, 'TravelerID' | 'LastName' | 'Country' | 'Gender'> {}

// Travelers model
class TravelerDetail
  extends Model<TravelerDetailAttributes, TravelerCreationAttributes>
  implements TravelerDetailAttributes
{
  public TravelerID!: number;
  public FirstName!: string;
  public LastName?: string;
  public Country?: string;
  public Gender?: 'male' | 'female' | 'other';
  public Status!: number;
  public UserID!: number;
  public readonly CreatedAt?: Date;
  public readonly UpdatedAt?: Date;
}

// Initialize
TravelerDetail.init(
  {
    TravelerID: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    FirstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    LastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
    },
    Status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: true,
    },
    UserID: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'UserID',
      },
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
    tableName: 'traveler_details',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt',
  }
);

export default TravelerDetail;
