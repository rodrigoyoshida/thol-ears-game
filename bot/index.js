import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import cors from 'cors'
import * as https from 'https'
import * as fs from 'fs'

const {
  BOT_TOKEN,
  GAME_NAME,
  GAME_URL,
  PORT,
  SSL_ENABLED,
  SSL_KEY_PATH,
  SSL_CERT_PATH
} = process.env

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

if (SSL_ENABLED) {
  var privateKey = fs.readFileSync(SSL_KEY_PATH);
  var certificate = fs.readFileSync(SSL_CERT_PATH);

  https.createServer({
    key: privateKey,
    cert: certificate
  }, app).listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`)
  })
} else {
  app.listen(PORT, function listen() {
    console.log(`Server is listening at http://localhost:${PORT}`)
  })
}