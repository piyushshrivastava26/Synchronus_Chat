import express from 'express'
import dotenv from 'dotenv'
import { startSendOTPConsumer } from './consumer.js'


dotenv.config()

const app = express()

startSendOTPConsumer()

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`MAIL APP IS RUNNING ON ${PORT}`)
})