import express from 'express';
import { User, Expense } from '../models';

const router = express.Router();

// Get all expenses for a user
router.get('/user/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    const user = await User.findOne({ where: { telegram_id: telegramId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const expenses = await Expense.findAll({
      where: { user_id: user.id },
      order: [['added_at', 'DESC']]
    });

    return res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new expense
router.post('/', async (req, res) => {
  try {
    const { telegram_id, description, amount, category } = req.body;

    if (!telegram_id || !description || !amount || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findOne({ where: { telegram_id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const expense = await Expense.create({
      user_id: user.id,
      description,
      amount: parseFloat(amount),
      category,
      added_at: new Date()
    });

    return res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await expense.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 