import { v2 as cloudinaryV2 } from "cloudinary";
import { config } from "dotenv";

config();

cloudinaryV2.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME || process.env.cloudinary_cloud_name,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.cloudinary_api_key,
  api_secret:
    process.env.CLOUDINARY_API_SECRET || process.env.cloudinary_api_secret,
});

export default cloudinaryV2;
