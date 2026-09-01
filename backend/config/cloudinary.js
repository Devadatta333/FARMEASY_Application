import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file buffer to Cloudinary (or fallback to local static folder if keys are not set)
 * @param {Buffer} fileBuffer
 * @param {String} originalName
 * @returns {Promise<{ url: String, public_id: String }>}
 */
export const uploadProductImage = async (fileBuffer, originalName = "product.jpg") => {
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "farmeasy/products",
          transformation: [{ width: 1000, height: 1000, crop: "limit", quality: "auto" }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );
      stream.end(fileBuffer);
    });
  } else {
    // Fallback local file storage for seamless local development
    const uploadsDir = path.join(__dirname, "../uploads/products");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(originalName) || ".jpg";
    const filename = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, fileBuffer);

    return {
      url: `/uploads/products/${filename}`,
      public_id: filename,
    };
  }
};

export default cloudinary;
