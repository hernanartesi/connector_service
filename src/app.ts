import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './models';
import expenseRoutes from './routes/expenseRoutes';
import { initBot } from './services/telegramService';
import { Server } from 'http';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Track application state
let isReady = false;
let server: Server;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  if (!isReady) {
    return res.status(503).json({ status: 'Service not ready' });
  }
  res.status(200).json({ status: 'OK' });
});

// Routes
app.use('/api/expenses', expenseRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Telegram Expense Tracker API');
});

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down gracefully...');
  isReady = false;

  try {
    // Close HTTP server
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log('HTTP server closed');
          resolve(true);
        });
      });
    }

    // Close database connection
    await sequelize.close();
    console.log('Database connection closed');

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle process events
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  shutdown();
});

// Start the server
async function startServer() {
  try {
    // First test database connection
    await sequelize.authenticate();
    console.log('Database connection established');

    // Sync database
    await sequelize.sync();
    console.log('Database synchronized');

    // Start Express server
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Start Telegram bot
    initBot();
    console.log('Telegram bot started');

    // Mark application as ready
    isReady = true;
    console.log('All services initialized successfully');

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

startServer().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

export default app; 