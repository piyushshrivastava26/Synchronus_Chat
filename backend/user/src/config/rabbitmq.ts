import amqp from 'amqplib'

// RabbitMQ is a message broker.

// Think of RabbitMQ as a post office
// and amqplib as the delivery truck your Node app uses to talk to that post office.


// amqplib is a Node library that lets your app:
//     connect to RabbitMQ
//     send messages
//     receive messages
//     create queues & exchanges

// 👉 RabbitMQ speaks AMQP protocol
// 👉 Node cannot speak AMQP by itself
// 👉 amqplib is the translator -> tp connect/speak to RabbitMQ

let channel: amqp.Channel

// This code creates one RabbitMQ connection and one reusable channel at app startup, so the rest of the app can safely publish and consume messages without reconnecting.
export const connectRabbitMQ = async () => {
    
    try {
        // amqp.connect() opens a TCP connection to RabbitMQ
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD
        })

        channel = await connection.createChannel()

        console.log("RabbitMQ connection established successfully")
    } 
    catch (error) {
        console.log("Failed to connect to RabbitMQ:", error)
    }
}


export const publishToQueue = async (queueName:string, message:any) => {
    
    if(!channel) {
        console.log("RabbitMQ channel is not initialized")
        return
    }

    // CREATES THE QUEUE
    await channel.assertQueue(queueName, {durable: true})
    
    // SENDING THE MESSAGE TO QUEUE
    channel.sendToQueue(
        queueName, 
        Buffer.from(JSON.stringify(message)),

        // Saves this message to disk
        { persistent: true }
    )
}