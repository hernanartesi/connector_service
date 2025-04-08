import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface ExpenseAttributes {
  id: number;
  user_id: number;
  description: string;
  amount: number;
  category: string;
  added_at: Date;
}

interface ExpenseCreationAttributes extends Optional<ExpenseAttributes, 'id'> {}

class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> implements ExpenseAttributes {
  public id!: number;
  public user_id!: number;
  public description!: string;
  public amount!: number;
  public category!: string;
  public added_at!: Date;
}

Expense.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    added_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'expenses',
    timestamps: false,
  }
);

User.hasMany(Expense, {
  sourceKey: 'id',
  foreignKey: 'user_id',
  as: 'expenses',
});

Expense.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

export default Expense; 