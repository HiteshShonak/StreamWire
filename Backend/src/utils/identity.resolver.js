import { uploadOnCloudinary } from "./cloudinary.js";

export const resolveIdentityMedia = async ({
  localPath,
  type,
  username,
  fullName,
  chosenColor,
  existingData = null,
}) => {
  const timestamp = Date.now();
  const cleanUsername = username.toLowerCase();

  if (localPath) {
    const upload = await uploadOnCloudinary(
      localPath,
      type,
      `${type}_${cleanUsername}_${timestamp}`
    );

    if (!upload?.secure_url || !upload?.public_id) {
      throw new Error(`Failed to upload ${type} image`);
    }

    return { url: upload.secure_url, public_id: upload.public_id };
  }

  if (existingData?.url?.includes("cloudinary.com") && !chosenColor) {
    return existingData;
  }

  const color = chosenColor?.replace("#", "") || "2563eb";

  if (type === "avatar") {
    const firstLetter = (fullName || username || "U")
      .trim()
      .charAt(0)
      .toUpperCase();

    return {
      url: `https://ui-avatars.com/api/?name=${firstLetter}&background=${color}&color=fff&bold=true&length=1&uppercase=true`,
      public_id: `default_avatar_${cleanUsername}_${timestamp}`,
    };
  } else {
    return {
      url: `https://placehold.jp/${color}/${color}/1280x300.png?text=%20`,
      public_id: `default_cover_${cleanUsername}_${timestamp}`,
    };
  }
};
