import sequelize from './config/database';
import Message from './models/Message';

// Add more models here as they're created

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models with the database
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export { sequelize, Message, initializeDatabase }; 