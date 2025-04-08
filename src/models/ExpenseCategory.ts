import { DataTypes, Model, Optional } from "sequelize"
import sequelize from "../config/database"

interface ExpenseCategoryAttributes {
  id: number
  name: string
}

interface ExpenseCategoryCreationAttributes
  extends Optional<ExpenseCategoryAttributes, "id"> {}

class ExpenseCategory
  extends Model<ExpenseCategoryAttributes, ExpenseCategoryCreationAttributes>
  implements ExpenseCategoryAttributes
{
  public id!: number
  public name!: string
}

ExpenseCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "expense_categories",
    timestamps: true,
  }
)
export default ExpenseCategory
