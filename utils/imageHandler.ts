import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import * as cheerio from 'cheerio';
import { uploadBufferToS3 } from './upload'; // helper for buffer upload
import { s3 } from './upload';

export const uploadToS3 = async (file: Express.Multer.File) => {
  const key = `articles/${uuidv4()}${path.extname(file.originalname)}`;
  const uploadParams = {
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: 'public-read',
  };

  await s3.putObject(uploadParams).promise();

  return {
    key,
    url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`,
  };
};
export const parseAndReplaceImagesInHTML = async (html: string) => {
  if (!html) {
    // If html is undefined, null, or empty string, just return empty result
    return { updatedHTML: '', uploadedImages: [] };
  }
  console.log('Loaded cheerio:', typeof cheerio.load === 'function');
  const $ = cheerio.load(html);
  const uploadedImages: { key: string; url: string }[] = [];

  const images = $('img');
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = $(img).attr('src');

    if (src?.startsWith('data:image')) {
      const matches = src.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = Buffer.from(matches[2], 'base64');
        const key = `articles/${uuidv4()}.png`;

        // Upload buffer to S3
        const upload = await uploadBufferToS3(base64Data, key, mimeType);

        // Replace base64 src with S3 url
        $(img).attr('src', upload.url);

        uploadedImages.push(upload);
      }
    }
  }

  return {
    updatedHTML: $.html(),
    uploadedImages,
  };
};