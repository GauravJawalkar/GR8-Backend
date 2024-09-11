import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const getAllVideos = async (req, res) => {

    // Algorithm to get all videos based on query, sort, pagination
    console.log("All vidoes fetched successfully")

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Videos on query searched successfully"))

}

const publishVideos = async (req, res) => {

    // Algorithm To publish a video on cloudinary with the help of multer middleware

    return res
        .status(200)
        .json(new ApiResponse(200, { video: "videoName" }, "video published Successfully"))

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