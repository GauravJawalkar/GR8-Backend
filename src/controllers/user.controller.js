import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import mongoose from 'mongoose'

// Gererate Access And Refresh Token for the user
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating refresh and access tokens')
    }
}

// Register Or signup User
const registerUser = async (req, res) => {

    // Get User Details from frontend 
    // validation : If the user already exists
    // check if user already exist:username,email
    // check for images, check for avatar
    // upload images to cloudinary
    //  create user object - create entry in database
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { username, fullName, email, password } = req.body


    if (
        [username, fullName, email, password].some((field) => { return field?.trim() === "" })
    ) {
        throw new ApiError(400, `Every field is required`)
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiError(409, 'User with Username or Email already exists.')
    }


    // Here the .files access is given by multer to use the files which are uploaded on the system temporarily in the public/temp dir and use their functionality like path , originalname,filename,etc

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.CoverImage[0]?.path;
    // console.log(req.files)
    // console.log(avatarLocalPath) 
    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.CoverImage) && req.files.CoverImage.length > 0) {
        coverImageLocalPath = req.files.CoverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avtar File is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar File is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )


}

// Login the registered user
const loginUser = async (req, res) => {

    // *** Algorithm and steps to build login logic ***
    // req.body=>data
    // username or email
    // find the user in the database
    // password check
    // access and refresh token
    // send cookie

    const { email, username, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({ $or: [{ email }, { username }] })

    if (!user) {
        throw new ApiError(404, "user doesn't exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invaild password credentials')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id); // This user._id will be passed as a parameter to the generateAccessAnd RefreshTokens function where it will then generate the access and refresh token for the specific user

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // We get this options object from cookie parser
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User Logged In Successfully"
            )
        )

}

// Logout the logged-in user
const logoutUser = async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User Logged Out Successfully"))
}

// Refresh the accessToken here after it has expired for keeping user logged in 
const refreshAccessToken = async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access Token Refreshed Successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }

}

// Change the current password that is set with the username or email
const changeCurrentPassword = async (req, res) => {

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!(newPassword === confirmPassword)) {
        throw new ApiError(400, "Please make sure the password for confirmation are same")
    }

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))

}

// getting current details of the user
const getCurrentUser = async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "current user fetched successfully"))

}

// Updating user account details like fullName and email
const updateAccountDetails = async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true } // this helps to get the information after it is updated
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account Details Updated Successfully"))

}

// Changing and updating avatar img file by taking access of "req.files" from the multer middleware
const updateAvatar = async (req, res) => {
    console.log("Update Avatar function starts here")
    const avatarLocalPath = req.files?.path
    console.log(avatarLocalPath);
    // const avatarImageToBeDeleted = req.file?.avatar[0]?.path


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is Missing");
    }

    // await User.findByIdAndDelete(req.user._id,
    //     {
    //         $unset: {
    //             avatar: avatarImageToBeDeleted
    //         }
    //     }
    // )

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "New avatar image updated successfully"))

}

// Changing and updating coverImage file by taking access of "req.files" from the multer middleware
const updateCoverImage = async (req, res) => {
    const coverImgLocalPath = req.file?.path

    if (!coverImgLocalPath) {
        throw new ApiError(400, "Cover image file is Missing");
    }

    const coverImage = await uploadOnCloudinary(coverImgLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error whiile uploading on cover image");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                CoverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "New cover image updated successfully"))

}

const getUserChannelProfile = async (req, res) => {

    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }

        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    console.log(channel)

}

const getWatchHistory = async (req, res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, user[0].watchHistory, "WatchHistory Fetched Successfully"))

}

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
}