// utils/upload.ts
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';

dotenv.config();
export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET!,
    acl: 'public-read',
    metadata: function (_req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (_req, file, cb) {
      const uniqueName = Date.now().toString() + '-' + file.originalname;
      cb(null, uniqueName);
    },
  }),
});

export const uploadBufferToS3 = async (buffer: Buffer, key: string, mimeType: string) => {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    // ACL: 'public-read',
  };

  await s3.putObject(uploadParams).promise();

  return {
    key,
    url: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  };
};

export const memoryUpload = multer({ storage: multer.memoryStorage() });

export default upload;
