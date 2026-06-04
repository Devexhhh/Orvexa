import cloudinary from "./cloud/cloudinary";

export async function uploadToCloudinary(filePath: string, folder: string) {
    return cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: "auto",
        timeout: 60000,
    });
}
