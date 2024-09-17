import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// trip interface
interface TripAttributes {
  TripID: number;
  CityID: number;
  TripName?: string;
  StartDate: Date;
  EndDate: Date;
  Duration: number;
  TravelerID: number;
  CreatedAt?: Date;
  DeletedAt?: Date;
}

interface TripCreationAttributes extends Optional<TripAttributes, 'TripID' | 'TripName'> {}

// trip model
class Trip extends Model<TripAttributes, TripCreationAttributes> implements TripAttributes {
  public TripID!: number;
  public CityID!: number;
  public TripName?: string;
  public StartDate!: Date;
  public EndDate!: Date;
  public Duration!: number;
  public TravelerID!: number;
  public readonly CreatedAt?: Date;
  public readonly DeletedAt?: Date;
}

// Initialize
Trip.init(
  {
    TripID: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    CityID: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'cities',
        key: 'CityID',
      },
    },
    TripName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    StartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    EndDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    Duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    TravelerID: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'traveler_details',
        key: 'TravelerID',
      },
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
    DeletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'trips',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: false,
    deletedAt: 'DeletedAt',
    paranoid: true,
  }
);

export default Trip;
