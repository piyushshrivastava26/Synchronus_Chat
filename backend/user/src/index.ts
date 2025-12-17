import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import {createClient} from 'redis'
import userRoutes from './routes/userRoute.js'
import { connectRabbitMQ } from './config/rabbitmq.js'
import cors from 'cors'

dotenv.config()
connectDB()
await connectRabbitMQ()

// REDIS CLIENT CONNECTION
if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined in .env")
}
export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
})
redisClient.connect()
    .then(() => console.log("REDIS CLIENT CONNECTED"))
    .catch(console.error)


const app = express()

// MW
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// CORS
app.use(cors())

app.use("/api/v1", userRoutes)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`BACKEND IS RUNNING ON PORT ${PORT}`)
})  