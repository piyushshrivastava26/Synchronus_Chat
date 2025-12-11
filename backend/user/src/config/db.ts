import mongoose from 'mongoose'

const connectDB = async () => {

    const url = process.env.MONGODB_CONNECTION_URI

    if(!url){
        throw Error("MONGODB_CONNECTION_URI is not defined in .env")
    }
    
    try {
        const connect = await mongoose.connect(url, {

            autoIndex : false,
            serverSelectionTimeoutMS : 5000 // 5ms
        })
        console.log(`MongoDB Connected : ${connect.connection.host}`)
    } 
        catch (error) {
        console.error("Database Connection Failed", error)
        process.exit(1)
    }

    mongoose.connection.on("disconnected", () => {
        console.log("MongoDB Disconnected")
    })
}


export default connectDB;