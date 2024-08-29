import mongoose from "mongoose";
import { DB_NAME } from '../constants.js'

async function connectDB() {
    try {
        const connectionInstance = await mongoose.connect
            (`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`\nMongoDB connected Successfully !! DB HOST: ${connectionInstance.connection.host}`)
        console.log(`${DB_NAME}`)
    } catch (error) {
        console.log("Mongodb connection Failed ", error)
        process.exit(1)
    }
}

export default connectDB