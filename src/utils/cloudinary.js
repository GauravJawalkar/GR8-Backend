import fs from "fs"
import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // File has been uploaded successfully
        // console.log("File uploaded Successfully", response.url);
        fs.unlinkSync(localFilePath)  // remove the locally saved temp file as the upload operation get executed successfully
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)  // remove the locally saved temp file as the upload operation got failed
        return null;
    }
}



export { uploadOnCloudinary }