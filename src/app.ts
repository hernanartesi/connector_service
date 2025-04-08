import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './models';
import expenseRoutes from './routes/expenseRoutes';
import { initBot } from './services/telegramService';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health check
app.get('/health', (_, res) => {
  res.status(200).send('OK');
});

app.use('/api/expenses', expenseRoutes);

app.get('/', (_, res) => {
  res.send('Telegram Expense Tracker API');
});

// Start the server
async function startServer() {
  try {
    await sequelize.sync();
    console.log('Database synchronized');

    initBot();
    console.log('Telegram bot started');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app; 