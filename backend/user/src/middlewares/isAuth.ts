import type { NextFunction, Request, Response } from "express";
import type { IUser } from "../model/User.js";
import jwt, { type JwtPayload } from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {

    user?: IUser | null
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {

    try {
        const authHeader = req.headers.authorization
        
        if(!authHeader || !authHeader.startsWith("Bearer ")){

            res.status(401).json({
                message: "No Authentication Header"
            })
            return
        }

        const token = authHeader.split(" ")[1]

        if (!token) {
            res.status(401).json({
                message: "Token missing"
            })
            return
        }

        if (!process.env.JWT_SECRET) {
            res.status(500).json({
                message: "JWT_SECRET is not defined"
            })
            return
        }

        const decodeValue = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload

        if(!decodeValue || !decodeValue.user){
            res.status(401).json({
                message: "Invalid Token"
            })
        }


        // SEND USER TO THE REQUEST BODY
        req.user = decodeValue.user

        next()

    } catch (error) {
        res.status(401).json({ message: "Unauthorized" })
    }
}