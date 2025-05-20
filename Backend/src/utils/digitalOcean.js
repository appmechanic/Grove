import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const spacesEndpoint = `https://${process.env.DO_SPACES_ENDPOINT}`;

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  region: process.env.DO_SPACES_REGION,
});

export const uploadToDO = async (file) => {
  try {
    const fileName = `${uuidv4()}-${file.originalname}`;

    const params = {
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    };

      const data = await s3.upload(params).promise();
    console.log("✅ File uploaded successfully to DigitalOcean Spaces:", data.Location);
    return data.Location;
  } catch (error) {
    console.error("❌ Error uploading to DigitalOcean Spaces:", error);
    throw new Error("Failed to upload image to storage");
  }
};
