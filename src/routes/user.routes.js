import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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


export default router