import TelegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
import { User, Expense } from "../models"
import { messageAnalysisService } from "./messageAnalysisService"
import { ExpenseDTO } from "../models/ExpenseDTO"

dotenv.config()

const token = process.env.TELEGRAM_BOT_TOKEN || ""
const bot = new TelegramBot(token, { polling: true })

// Helper to find or create user based on Telegram ID
async function findUser(telegramId: string): Promise<User | null> {
  const user = await User.findOne({
    where: { telegram_id: telegramId },
  })
  return user
}

// Parse expense message format: [amount] [category] [description]
// Example: "25.50 food Lunch at restaurant"
async function parseExpenseMessage(
  message: string,
  userId: number
): Promise<ExpenseDTO | null> {
  try {
    // Use the message analysis service to analyze the message
    const expense: ExpenseDTO =
      await messageAnalysisService.analyzeMessage(message, userId)

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
  // Command for starting the bot
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id
    const telegramId = msg.from?.id.toString() || ""
    console.log(telegramId)
    try {
      const user = await findUser(telegramId)
      if (!user) {
        return
      }

      const expense = await parseExpenseMessage(msg.text || "", user.id)

      if (!expense) {
        return
      }

      bot.sendMessage(chatId, `${expense.category} expense added`)
    } catch (error) {
      console.error("Error processing message:", error)
      bot.sendMessage(
        chatId,
        "Error processing your message. Please try again."
      )
    }
  })

  // Command to list recent expenses
  bot.onText(/\/list/, async (msg) => {
    const chatId = msg.chat.id
    const telegramId = msg.from?.id.toString() || ""

    try {
      const user = await findUser(telegramId)
      if (!user) {
        return
      }

      const expenses = await Expense.findAll({
        where: { user_id: user.id },
        order: [["added_at", "DESC"]],
        limit: 5,
      })

      if (expenses.length === 0) {
        bot.sendMessage(chatId, "You have no recorded expenses yet.")
        return
      }

      let message = "📊 Your recent expenses:\n\n"
      expenses.forEach((expense, index) => {
        message += `${index + 1}. $${expense.amount} - ${expense.category}\n   ${expense.description}\n   ${expense.added_at.toLocaleDateString()}\n\n`
      })

      bot.sendMessage(chatId, message)
    } catch (error) {
      console.error("Error in /list command:", error)
      bot.sendMessage(chatId, "Error retrieving expenses. Please try again.")
    }
  })

  console.log("Telegram bot started")
}

export { bot, initBot }
