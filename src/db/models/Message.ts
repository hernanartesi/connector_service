import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MessageAttributes {
  id: number;
  chatId: string;
  text: string;
  fromUser: boolean;
  timestamp: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public chatId!: string;
  public text!: string;
  public fromUser!: boolean;
  public timestamp!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chatId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fromUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'messages',
  }
);

export default Message; 