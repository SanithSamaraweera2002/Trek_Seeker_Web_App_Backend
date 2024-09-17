import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// city interface
interface CityAttributes {
  CityID: number;
  CityName: string;
  CityDescription?: string;
  CityLatitude?: number;
  CityLongitude?: number;
  CityImage?: string;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  DeletedAt?: Date;
}

interface CityCreationAttributes
  extends Optional<CityAttributes, 'CityID' | 'CityDescription' | 'CityLatitude' | 'CityLongitude' | 'CityImage'> {}

class City extends Model<CityAttributes, CityCreationAttributes> implements CityAttributes {
  public CityID!: number;
  public CityName!: string;
  public CityDescription?: string;
  public CityLatitude?: number;
  public CityLongitude?: number;
  public CityImage?: string;
  public readonly CreatedAt?: Date;
  public readonly UpdatedAt?: Date;
  public readonly DeletedAt?: Date;
}

City.init(
  {
    CityID: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    CityName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CityDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    CityLatitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    CityLongitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    CityImage: {
      type: DataTypes.STRING,
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
    DeletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'cities',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt',
    deletedAt: 'DeletedAt',
    paranoid: true,
  }
);

export default City;
