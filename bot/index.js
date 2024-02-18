import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import cors from 'cors'

const { BOT_TOKEN, GAME_NAME, GAME_URL, PORT } = process.env

const bot = new TelegramBot(BOT_TOKEN, { polling: true })
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('game'))

bot.onText(/\/earsgame/, function onPhotoText(msg) {
  bot.sendGame(msg.chat.id, GAME_NAME)
})

bot.on('callback_query', function onCallbackQuery(msg) {
  const {
    id, 
    from: {
      id: user_id
    },
    message: {
      message_id,
      chat: {
        id: chat_id
      }
    }
  } = msg
  const url = `${GAME_URL}?user_id=${user_id}&message_id=${message_id}&chat_id=${chat_id}`
  bot.answerCallbackQuery(id, { url })
})

app.post('/score', async (req, res) => {
  try {
    const { user_id, score, chat_id, message_id } = req.body
    await bot.setGameScore(user_id, score, {
      chat_id,
      message_id
    })
    res.status(200).send()
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
})

app.listen(PORT, function listen() {
  console.log(`Server is listening at http://localhost:${PORT}`)
})