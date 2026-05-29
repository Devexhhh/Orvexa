import { Request, Response } from "express";
import fs from "fs/promises";
import { allowedMimeTypes } from "./fileValidator";
import { uploadToCloudinary } from "./storage.service";

export async function uploadFileController(req: Request, res: Response) {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        if (!allowedMimeTypes.includes(file.mimetype)) {
            await fs.unlink(file.path);

            return res.status(400).json({
                success: false,
                message: "Invalid file type",
            });
        }

        const isImage = file.mimetype.startsWith("image");
        const uploadResult = await uploadToCloudinary(
            file.path,

            isImage ? "orvexa/images" : "orvexa/files",
        );

        //
        // Remove local temp file
        //
        await fs.unlink(file.path);

        return res.status(200).json({
            success: true,

            file: {
                fileUrl: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
            },
        });
    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Upload failed",
        });
    }
}
