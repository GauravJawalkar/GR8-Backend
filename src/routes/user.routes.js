import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    // injecting the multer middleware for file handeling before the execution of the registerUser function
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'CoverImage',
            maxCount: 1
        }
    ]),
    registerUser
) // working

router.route("/login").post(loginUser) // working

// secured Routes
router.route("/logout").post(verifyJwt, logoutUser) // working
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJwt, changeCurrentPassword) // working
router.route("/current-user").get(verifyJwt, getCurrentUser) // working
router.route("/update-account").patch(verifyJwt, updateAccountDetails) // working
router.route("/updateAvatar").patch(verifyJwt, upload.single('avatar'), updateAvatar) // need to work
router.route("/update-coverImage").patch(verifyJwt, upload.single("CoverImage"), updateCoverImage) // need to work
router.route("/c/:username").get(verifyJwt, getUserChannelProfile) // working
router.route("/history").get(verifyJwt, getWatchHistory) // working 

export default router