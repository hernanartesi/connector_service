import TelegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
import { User, Expense } from "../models"
import { messageAnalysisService } from "./messageAnalysisService"
import { ExpenseDTO } from "../models/ExpenseDTO"
import { Op } from "sequelize"

dotenv.config()

const token = process.env.TELEGRAM_BOT_TOKEN || ""
const bot = new TelegramBot(token, { 
  polling: true,
  filepath: false // Disable file download to memory
})

// Rate limiting map
const messageRateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_MESSAGES_PER_WINDOW = 5;

// Helper to find or create user based on Telegram ID
async function findOrCreateUser(telegramId: string): Promise<User> {
  let user = await User.findOne({
    where: { telegram_id: telegramId },
  })
  
  if (!user) {
    user = await User.create({ telegram_id: telegramId })
    console.log('Created new user:', telegramId)
  }
  
  return user
}

// Check rate limit for a user
function checkRateLimit(telegramId: string): boolean {
  const now = Date.now();
  const userLastMessage = messageRateLimit.get(telegramId) || 0;
  
  if (now - userLastMessage < RATE_LIMIT_WINDOW) {
    return false; // Rate limited
  }
  
  messageRateLimit.set(telegramId, now);
  return true;
}

// Parse expense message format: [amount] [category] [description]
// Example: "25.50 food Lunch at restaurant"
async function parseExpenseMessage(
  message: string,
  userId: number
): Promise<ExpenseDTO | null> {
  try {
    const expense = await messageAnalysisService.analyzeMessage(message, userId)
    if (expense?.category === "unknown") {
      return null
    }
    return expense
  } catch (error) {
    console.error("Error analyzing message:", error)
    return null
  }
}

// Initialize bot commands and message handling
function initBot() {
  // Handle errors
  bot.on('error', (error) => {
    console.error('Telegram bot error:', error);
  });

  bot.on('polling_error', (error) => {
    console.error('Telegram polling error:', error);
  });

  // Command for starting the bot
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
      'Welcome to the Expense Tracker Bot!\n\n' +
      'To add an expense, send a message in this format:\n' +
      '[amount] [category] [description]\n\n' +
      'For example:\n' +
      '25.50 food Lunch at restaurant\n\n' +
      'Use /list to see your recent expenses.'
    );
  });

  // Handle messages
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id
    const telegramId = msg.from?.id.toString()
    
    if (!telegramId) {
      console.log('No telegram ID found in message')
      return
    }

    // Check rate limit
    if (!checkRateLimit(telegramId)) {
      bot.sendMessage(chatId, "Please wait a moment before sending another message.");
      return;
    }

    // Ignore commands
    if (msg.text?.startsWith('/')) {
      return
    }

    try {
      const user = await findOrCreateUser(telegramId)
      const expense = await parseExpenseMessage(msg.text || "", user.id)

      if (!expense) {
        bot.sendMessage(
          chatId,
          "Could not understand the expense format. Please use: [amount] [category] [description]\n" +
          "For example: 25.50 food Lunch at restaurant"
        )
        return
      }

      // Create the expense in the database
      await Expense.create({
        user_id: user.id,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        added_at: new Date()
      })

      bot.sendMessage(
        chatId,
        `✅ Added expense:\n💰 ${expense.amount}\n📁 ${expense.category}\n📝 ${expense.description}`
      )
    } catch (error) {
      console.error("Error processing message:", error)
      bot.sendMessage(
        chatId,
        "Sorry, there was an error processing your expense. Please try again."
      )
    }
  })

  // Command to list recent expenses
  bot.onText(/\/list/, async (msg) => {
    const chatId = msg.chat.id
    const telegramId = msg.from?.id.toString()

    if (!telegramId) {
      console.log('No telegram ID found in list command')
      return
    }

    // Check rate limit
    if (!checkRateLimit(telegramId)) {
      bot.sendMessage(chatId, "Please wait a moment before trying again.");
      return;
    }

    try {
      const user = await findOrCreateUser(telegramId)
      
      // Use a time window for recent expenses
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const expenses = await Expense.findAll({
        where: { 
          user_id: user.id,
          added_at: {
            [Op.gte]: oneMonthAgo
          }
        },
        order: [["added_at", "DESC"]],
        limit: 5,
      })

      if (expenses.length === 0) {
        bot.sendMessage(chatId, "You have no recorded expenses in the last month.")
        return
      }

      let message = "📊 Your recent expenses:\n\n"
      expenses.forEach((expense, index) => {
        message += `${index + 1}. 💰 ${expense.amount} - 📁 ${expense.category}\n   📝 ${expense.description}\n   📅 ${expense.added_at.toLocaleDateString()}\n\n`
      })

      bot.sendMessage(chatId, message)
    } catch (error) {
      console.error("Error in /list command:", error)
      bot.sendMessage(chatId, "Error retrieving expenses. Please try again.")
    }
  })

  console.log("Telegram bot started with rate limiting enabled")
}

export { bot, initBot }
