import {v2 as cloudinary} from "cloudinary"
import fs from "fs" // file system module to handle file operations like delete


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => { 
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        // console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file after successful upload to cloudinary
        return response; // return the details of uploaded file on cloudinary 

    } catch (error) {
        
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed 
        return null; // return null in case of any error during upload operation
    }
}



const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        if (!publicId) return null;
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };