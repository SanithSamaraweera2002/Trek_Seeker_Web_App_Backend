import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface HotelAssignAttributes {
  AssignmentID: number;
  TripID: number;
  DayNumber: number;
  HotelID: string;
  CreatedAt?: Date;
}

interface HotelAssignCreationAttributes extends Optional<HotelAssignAttributes, 'AssignmentID'> {}

class HotelAssign extends Model<HotelAssignAttributes, HotelAssignCreationAttributes> implements HotelAssignAttributes {
  public AssignmentID!: number;
  public TripID!: number;
  public DayNumber!: number;
  public HotelID!: string;
  public readonly CreatedAt?: Date;
}

HotelAssign.init(
  {
    AssignmentID: {
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
    HotelID: {
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
    tableName: 'hotel_assignments',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: false,
  }
);

export default HotelAssign;
