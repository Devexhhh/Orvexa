import multer from "multer";
import path from "path";
import fs from "fs";
const tempPath = "src/storage/uploads/temp";

//
// Ensure temp folder exists
//
fs.mkdirSync(tempPath, {
    recursive: true,
});

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, tempPath);
    },

    filename(req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.random()}`;
        const extension = path.extname(file.originalname);

        cb(
            null,
            `${uniqueSuffix}${extension}`,
        );
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});
