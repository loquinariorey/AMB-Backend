"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryUpload = exports.uploadBufferToS3 = exports.s3 = void 0;
// utils/upload.ts
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: exports.s3,
        bucket: process.env.S3_BUCKET,
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
const uploadBufferToS3 = async (buffer, key, mimeType) => {
    const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        // ACL: 'public-read',
    };
    await exports.s3.putObject(uploadParams).promise();
    return {
        key,
        url: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
};
exports.uploadBufferToS3 = uploadBufferToS3;
exports.memoryUpload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
exports.default = upload;
