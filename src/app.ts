import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './models';
import expenseRoutes from './routes/expenseRoutes';
import { initBot } from './services/telegramService';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Track application state
let isReady = false;

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

// Keep the process alive
process.stdin.resume();

// Handle process events
process.on('SIGINT', () => {
  console.log('Received SIGINT. Performing graceful shutdown');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Performing graceful shutdown');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Start the server
async function startServer() {
  try {
    // Start Express server first
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Then sync database
    await sequelize.sync();
    console.log('Database synchronized');

    // Finally start Telegram bot
    initBot();
    console.log('All services initialized successfully');

    // Mark application as ready
    isReady = true;

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

export default app; 