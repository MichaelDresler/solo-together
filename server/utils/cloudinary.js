import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });
}

function buildAvatarUrl(publicId, gravity = "face") {
  return cloudinary.url(publicId, {
    secure: true,
    width: 512,
    height: 512,
    crop: "fill",
    gravity,
    fetch_format: "auto",
    quality: "auto:best",
  });
}

export async function uploadAvatar(buffer, userId) {
  try {
    const result = await uploadBuffer(buffer, {
      folder: "avatars",
      public_id: `user-${userId}-${Date.now()}`,
      resource_type: "image",
      overwrite: false,
      transformation: [
        {
          width: 512,
          height: 512,
          crop: "fill",
          gravity: "face",
        },
        {
          fetch_format: "auto",
          quality: "auto:best",
        },
      ],
    });

    return {
      avatarPublicId: result.public_id,
      avatarUrl: buildAvatarUrl(result.public_id, "face"),
    };
  } catch (error) {
    const result = await uploadBuffer(buffer, {
      folder: "avatars",
      public_id: `user-${userId}-${Date.now()}`,
      resource_type: "image",
      overwrite: false,
      transformation: [
        {
          width: 512,
          height: 512,
          crop: "fill",
          gravity: "auto",
        },
        {
          fetch_format: "auto",
          quality: "auto:best",
        },
      ],
    });

    return {
      avatarPublicId: result.public_id,
      avatarUrl: buildAvatarUrl(result.public_id, "auto"),
    };
  }
}

export async function deleteCloudinaryAsset(publicId) {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
  });
}

export default cloudinary;
