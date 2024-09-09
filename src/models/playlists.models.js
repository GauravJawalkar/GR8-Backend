import mongoose, { Schema } from "mongoose";

const playlistSchema = Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },
        videos: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Video",
                    required: true
                },
            ],
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },
    {
        timestamps: true
    }
)

export const Playlist = mongoose.model('Playlist', playlistSchema)