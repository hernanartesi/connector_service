import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './models';
import expenseRoutes from './routes/expenseRoutes';
import { initBot } from './services/telegramService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/expenses', expenseRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Telegram Expense Tracker API');
});

// Start the server
async function startServer() {
  try {
    // Sync all models with database
    await sequelize.sync();
    console.log('Database synchronized');

    // Start Telegram bot
    initBot();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app; 