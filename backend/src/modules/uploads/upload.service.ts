export function buildFileUrl(filename: string, isImage: boolean) {
    return isImage ? `/uploads/images/${filename}` : `/uploads/files/${filename}`;
}
