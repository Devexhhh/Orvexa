import cloudinary from "storage/cloud/cloudinary";

export async function uploadToCloudinary(
    filePath: string,

    folder: string,
) {
    return cloudinary.uploader.upload(
        filePath,

        {
            folder,

            resource_type: "auto",
        },
    );
}
