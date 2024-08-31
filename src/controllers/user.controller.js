import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'


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


    // Here the .files access is given nby multer to use te files which are uploaded on the system temporarily in the public/temp dir and use their functionality like path , originalname,filename,etc

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

export { registerUser }