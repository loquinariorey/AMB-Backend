"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const uuid_1 = require("uuid");
// AWS setup
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});
const bucketName = process.env.S3_BUCKET;
const uploadChatFile = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: bucketName,
        contentType: (req, file, cb) => {
            cb(null, file.mimetype);
        },
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const extension = file.originalname.split('.').pop();
            const fileName = `${(0, uuid_1.v4)()}.${extension}`;
            const s3Key = `chat/${fileName}`; // ✅ S3 folder for chat uploads
            cb(null, s3Key);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        // const allowedTypes = [
        //   'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        //   'application/pdf',
        //   'application/msword',
        //   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        //   'application/zip',
        // ];
        // if (!allowedTypes.includes(file.mimetype)) {
        //   console.log(`❌ Rejected file: ${file.originalname} (${file.mimetype})`);
        //   return cb(new Error('File type not allowed'), false);
        // }
        console.log(`✅ Accepted file: ${file.originalname}`);
        cb(null, true);
    },
});
exports.default = uploadChatFile;
