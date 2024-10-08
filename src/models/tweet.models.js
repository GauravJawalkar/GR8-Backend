import mongoose, { Schema } from "mongoose";


const tweetSchema = Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true
        }
    }
)

export const Tweet = mongoose.model("Tweet", tweetSchema)