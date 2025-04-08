# Telegram API App

A Node.js application that allows users to track their expenses through a Telegram bot. Built with Express, TypeScript, Sequelize, and PostgreSQL.

## Features

- Add expenses by sending messages to a Telegram bot
- Categorize expenses
- View recent expenses
- API endpoints for expense management

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Telegram Bot Token (from BotFather)

## Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/telegram-api-app.git
cd telegram-api-app
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory with the following variables:
```
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=expense_tracker
DB_HOST=localhost
DB_PORT=5432
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
PORT=3000
EXTERNAL_API_URL=http://localhost:8000/api/v1/messages/analyze
```

4. Create the PostgreSQL database
```sql
CREATE DATABASE expense_tracker;
```

5. Build and run the application
```bash
npm run build
npm start
```

For development:
```bash
npm run dev
```

## Using the Telegram Bot

1. Start a chat with your bot by searching for its username on Telegram
2. Use the following commands:
   - `/start` - Start the bot and get usage instructions
   - `/add [amount] [category] [description]` - Add a new expense (e.g., `/add 25.50 food Lunch at restaurant`)
   - `/list` - View your 5 most recent expenses

You can also directly send a message in the format `[amount] [category] [description]` to add an expense quickly.

## API Endpoints

- `GET /api/expenses/user/:telegramId` - Get all expenses for a user
- `POST /api/expenses` - Add a new expense
  ```json
  {
    "telegram_id": "12345678",
    "description": "Lunch at restaurant",
    "amount": 25.50,
    "category": "food"
  }
  ```
- `DELETE /api/expenses/:id` - Delete an expense

## Database Schema

```sql
CREATE TABLE users (
  "id" SERIAL PRIMARY KEY,
  "telegram_id" text UNIQUE NOT NULL
);

CREATE TABLE expenses (
  "id" SERIAL PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES users("id"),
  "description" text NOT NULL,
  "amount" money NOT NULL,
  "category" text NOT NULL,
  "added_at" timestamp NOT NULL
);
```

## License

MIT 