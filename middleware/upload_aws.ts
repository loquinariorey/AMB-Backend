import dotenv from 'dotenv';
dotenv.config();

import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

// 🚀 Initialize S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
});

// 📦 Bucket name
const bucketName = process.env.S3_BUCKET!;
console.log(`📦 Using S3 Bucket: ${bucketName}`);

// 🛠️ Setup multer + S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3 as any,
    bucket: bucketName,
    // acl: 'public-read',
    contentType: (req: Request, file: Express.Multer.File, cb: (error: Error | null, contentType: string) => void) => {
      cb(null, file.mimetype);
    },
    metadata: (req: Request, file: Express.Multer.File, cb: (error: Error | null, metadata: any) => void) => {
      // console.log(`📤 Starting upload for: ${file.originalname}`);
      cb(null, { fieldName: file.fieldname });
    },
    key: (req: Request, file: Express.Multer.File, cb: (error: Error | null, key: string) => void) => {
      const extension = file.originalname.split('.').pop(); // get extension like "jpg"
      const fileName = `${uuidv4()}.${extension}`; // hash-based name
      // console.log(`🔑 Generated UUID key: ${fileName}`);
      const s3Key = `recruit/${fileName}`; // ✅ save in "uploaded/" folder
      console.log(`🔑 Generated S3 Key: ${s3Key}`);
      cb(null, s3Key);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.log(`❌ File rejected: ${file.originalname} (type: ${file.mimetype})`);
      return cb(new Error('Only image files are allowed'));
    }
    console.log(`✅ File accepted: ${file.originalname}`);
    cb(null, true);
  },
});

export default upload;