import { v2 as cloudinary } from "cloudinary";

if (process.env.CLOUDINARY_URL) {
  cloudinary.config(true);
}

export const uploadBuffer = (buffer, folder, publicId) =>
  new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_URL) {
      return reject(new Error("CLOUDINARY_URL not configured"));
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: "auto" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
