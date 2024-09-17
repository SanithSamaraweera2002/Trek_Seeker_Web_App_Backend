import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DestinationAttributes {
  DestinationID: number;
  DestinationName: string;
  Description?: string;
  Image?: string;
  CityID: number;
  Latitude: number;
  Longitude: number;
  Ratings?: number;
  TimeSpent?: number;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  DeletedAt?: Date;
}

interface DestinationCreationAttributes
  extends Optional<DestinationAttributes, 'DestinationID' | 'Description' | 'Image' | 'Ratings' | 'TimeSpent'> {}

class Destination extends Model<DestinationAttributes, DestinationCreationAttributes> implements DestinationAttributes {
  public DestinationID!: number;
  public DestinationName!: string;
  public Description?: string;
  public Image?: string;
  public Ratings?: number;
  public TimeSpent?: number;
  public CityID!: number;
  public Latitude!: number;
  public Longitude!: number;
  public readonly CreatedAt?: Date;
  public readonly UpdatedAt?: Date;
  public readonly DeletedAt?: Date;
}

Destination.init(
  {
    DestinationID: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    DestinationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Ratings: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true,
    },
    TimeSpent: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CityID: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'cities',
        key: 'CityID',
      },
      allowNull: false,
    },
    Latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    Longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
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
    tableName: 'destinations',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt',
    deletedAt: 'DeletedAt',
    paranoid: true,
  }
);

export default Destination;
