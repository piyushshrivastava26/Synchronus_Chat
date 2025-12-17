// (also) CONTROLLER FOR READING THE consumer.ts 

import {type Request,type Response, type NextFunction} from 'express'
import TryCatch from '../config/tryCatch.js'
import { redisClient } from '../index.js'
import { publishToQueue } from '../config/rabbitmq.js'
import { User } from '../model/User.js'
import { generateToken } from '../config/generateToken.js'
import type { AuthenticatedRequest } from '../middlewares/isAuth.js'


// export const loginUser = async (req: Request, res: Response, next: NextFunction) => {

//     try {
        
//     } 
//     catch (error: any) {
//         return res.json({
//             message: error.message
//         })    
//     }
    
// }

export const loginUser = TryCatch( async (req, res) => {
    
    const {email} = req.body

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({
            message: "Invalid email format"
        })
    }

    const rateLimitKey = `otp:ratelimit:${email}`
    const ratelimit = await redisClient.get(rateLimitKey)

    if(ratelimit){
        res.status(429).json({
            message: "Too many requests. Please wait before requesting new OTP"
        })

        return
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // now, store this OTP in redis for a specific time
    const otpKey = `otp:${email}`

    await redisClient.set(otpKey, otp, {
        EX: 300 // means 300 seconds
    }),

    // set rate Limit
    await redisClient.set(rateLimitKey, "true", {
        EX: 60
    })

    const message = {
        to: email,
        subject: "OTP",
        body:  `Your login OTP for Synchronus Chat is ${otp}. It is valid for 5 minutes only.`
    }

    await publishToQueue("send-otp", message)

    res.status(200).json({
        message: "OTP Sent"
    })
})


export const verifyUser = TryCatch( async (req, res) => {
    
    const {email, otp:enteredOtp} = req.body

    if(!email || !enteredOtp){
        res.status(400).json({
            message: "All feilds are required"
        })
        return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({
            message: "Invalid email format"
        })
    }

    const otpKey = `otp:${email}`
    const storedOtp = await redisClient.get(otpKey)

    if(!storedOtp || storedOtp !== enteredOtp){
        return res.status(400).json({
            message: "Invalid OTP"
        })
    }

    // if OTP matched, delete it 
    await redisClient.del(otpKey)

    // FIND THE USER IN THE DATABASE
    let user = await User.findOne({email})
    let token: string

    if(!user){
        const name = email.slice(0, 8)
        user = await User.create({name, email})
    }

    token = generateToken(user)

    res.status(201).json({
        message: "User Verified",
        user, 
        token
    })
    return
    
})


export const myProfile = TryCatch( async (req:AuthenticatedRequest, res: Response) => {
    
    const user = req.user
    res.json(
        {
            message: "Profile fetched",
            user:user
        }
    )
})


export const updateName = TryCatch( async (req:AuthenticatedRequest, res: Response) => {
    
    const user = await User.findById(req.user?._id)

    if(!user){
        res.status(404).json({
            message: "Please login"
        })
        return
    }

    // const {name} = req.body
    user.name = req.body.name
    await user.save()

    const token = generateToken(user)

    res.status(200).json({
        message: "Name Updated",
        user,
        token
    })
})


export const getAllUsers = TryCatch(async (req:AuthenticatedRequest, res: Response) => {
    
    const users = await User.find()

    res.status(200).json({
        message: "Fetched All Users",
        noOfUsers: users.length,
        users
    })
})


export const getUserById = TryCatch( async (req:AuthenticatedRequest, res: Response) => {
    
    const Id = req.params.Id

    const user = await User.findById(Id)

    res.status(200).json({
        message: "Fetched Users",
        user
    })
})