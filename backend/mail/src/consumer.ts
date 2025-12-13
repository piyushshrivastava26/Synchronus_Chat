// IT IS A PART OF RABBIT MQ

// This file is a RabbitMQ consumer (worker) that:
    // listens to the "send-otp" queue
    // receives OTP email data
    // sends email using Nodemailer
    // acknowledges the message only after success

import amqp from 'amqplib'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()


export const startSendOTPConsumer = async () => {

    try {
        // CREATES TCP CONNECTION
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD
            
        })

        const channel = await connection.createChannel()

        // QUEUE SET-UP
        const queueName = "send-otp"
        await channel.assertQueue(queueName, {durable: true})
        
        console.log("Rabbit MQ : Mail service consumer started, listen for email OTPs")

        // CONSUME THE MESSAGE 
        channel.consume(queueName, async (msg) => {
            
            if(msg){
                try {
                    
                    const {to, subject, body} = JSON.parse(msg.content.toString())

                    // SET-UP SMTP CONNECTION TO GMAIL
                    const transporter = nodemailer.createTransport({

                        host: "smtp.gmail.com",
                        port: 465,

                        auth: {
                            user: process.env.USER,
                            pass: process.env.PASS
                        }
                    })

                    // NOW, SEND THE MAIL
                    await transporter.sendMail({

                        from: "Synchronus Chat",
                        to,
                        subject,
                        text:body
                    })
                    
                    console.log(`OTP mail sent to ${to}`)
                    channel.ack(msg)
                } 
                catch (error) {
                    console.log("Failed to send OTP: ", error) 
                }
            }
        }, {
            noAck: false
        })
    } 
    catch (error) {
        console.log("Failed to start RabbitMQ consumer: ", error)
    }
}
