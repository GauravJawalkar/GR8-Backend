import { Router } from "express";
import { getAllVideos, publishVideos, getVideoById } from '../controllers/video.controller.js'
import { verifyJwt } from '../middlewares/auth.middleware.js'

const router = Router();

router.route("/getAllVideos").get(getAllVideos)

// secured routes
router.route("/publish-videos").post(publishVideos) // verify the auth middleware here
router.route("/:id").get(getVideoById)

export default router