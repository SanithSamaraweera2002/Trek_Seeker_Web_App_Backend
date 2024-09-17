import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// itinerary interface
interface ItineraryAttributes {
  ItineraryID: number;
  TripID: number;
  DayNumber: number;
  DestinationID: number;
  OrderNumber: number;
  TimeFrom: string;
  TimeTo: string;
  CreatedAt?: Date;
}

interface ItineraryCreationAttributes extends Optional<ItineraryAttributes, 'ItineraryID'> {}

class Itinerary extends Model<ItineraryAttributes, ItineraryCreationAttributes> implements ItineraryAttributes {
  public ItineraryID!: number;
  public TripID!: number;
  public DayNumber!: number;
  public DestinationID!: number;
  public OrderNumber!: number;
  public TimeFrom!: string;
  public TimeTo!: string;
  public readonly CreatedAt?: Date;
}

// Initialize
Itinerary.init(
  {
    ItineraryID: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    TripID: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'trips',
        key: 'TripID',
      },
    },
    DayNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DestinationID: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'destinations',
        key: 'DestinationID',
      },
    },
    OrderNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    TimeFrom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    TimeTo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'itineraries',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: false,
  }
);

export default Itinerary;
