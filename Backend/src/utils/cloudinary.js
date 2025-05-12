import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError";

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new ApiError(400, "Please provide a file path");
    }

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File uploaded successfully
    console.log("File uploaded successfully on cloudinary", response.url);
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got succeeded
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    console.error("Error uploading file to Cloudinary:", error);
    throw new ApiError(500, "Error uploading file to Cloudinary", error);
  }
};

export { uploadOnCloudinary };
