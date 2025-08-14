import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
});

const localDir = path.join(__dirname, './images');

const uploadFile = (filePath: string, fileName: string) => {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: process.env.S3_BUCKET!,
    Key: `recruit/${fileName}`, // prefix "migrated/" to organize uploaded files
    Body: fileContent,
    // ACL: 'public-read',
    ContentType: 'image/jpeg', // or dynamically detect via mime-type lib
  };

  return s3.upload(params).promise();
};

(async () => {
  const files = fs.readdirSync(localDir);

  for (const file of files) {
    const fullPath = path.join(localDir, file);
    try {
      const result = await uploadFile(fullPath, file);
      console.log(`✅ Uploaded: ${file} → ${result.Location}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${file}:`, error);
    }
  }
})();
