import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './models';
import expenseRoutes from './routes/expenseRoutes';
import { initBot } from './services/telegramService';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Routes
app.use('/api/expenses', expenseRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Telegram Expense Tracker API');
});

// Start the server
async function startServer() {
  try {
    // Start Express server first
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    // Then sync database
    await sequelize.sync();
    console.log('Database synchronized');

    // Finally start Telegram bot
    initBot();
    console.log('All services initialized successfully');

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app; 