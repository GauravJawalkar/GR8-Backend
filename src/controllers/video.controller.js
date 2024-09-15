import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { Video } from '../models/video.models.js'
import { User } from '../models/user.models.js'

const getAllVideos = async (req, res) => {

    // Algorithm to get all videos based on query, sort, pagination

    const getVideo = await Video.find({ isPublished: true })

    return res
        .status(200)
        .json(new ApiResponse(200, getVideo, "Videos on query searched successfully"))

}

const publishVideos = async (req, res) => {

    // Algorithm To publish a video on cloudinary with the help of multer middleware
    // 1. Verify the user is authenticated or not -- Done
    // 2. Take video title, description -- Done
    // 3. Check the title and description of the video -- Done
    // 4. Check for videos
    // 5. Upload to cloudinary
    // 6. Create a video object : Create a video field in database
    // 7. Check for Video creation database in database
    // 8.  return response

    const { title, description, views, isPublished, duration } = req.body;
 
    if (!(title && description)) {
        throw new ApiError(400, "title and description is required")
    }

    const videoLocalPath = req.file?.path

    if (!videoLocalPath) {
        throw new ApiError(400, "Video File is missing")
    }

    const VideoFile = await uploadOnCloudinary(videoLocalPath)
    console.log(VideoFile)

    const videoDuration = VideoFile.duration;


    const video = await Video.create(
        {
            title,
            description,
            videoFile: VideoFile?.secure_url,
            thumbnail: "",
            views,
            isPublished: true,
            duration: videoDuration,
            owner: User.fullName
        }
    )

    if (!VideoFile) {
        throw new ApiError(400, "Video File not uploaded on cloudinary")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Uploaded Successfully"))


}

const getVideoById = async (req, res) => {
    const { id } = req.params;

    // Algorithm To publish a video on cloudinary with the help of multer middleware

    return res
        .status(200)
        .json(new ApiResponse(200, { video: id }, "fetched video Successfully"))

}


export {
    getAllVideos,
    publishVideos,
    getVideoById
}