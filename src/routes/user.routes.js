import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
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
)

router.route("/login").post(loginUser)

// secured Routes
router.route("/logout").post(verifyJwt, logoutUser)


export default router