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
// 🚀 Initialize S3
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});
// 📦 Bucket name
const bucketName = process.env.S3_BUCKET;
console.log(`📦 Using S3 Bucket: ${bucketName}`);
// 🛠️ Setup multer + S3 storage
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: bucketName,
        // acl: 'public-read',
        contentType: (req, file, cb) => {
            cb(null, file.mimetype);
        },
        metadata: (req, file, cb) => {
            // console.log(`📤 Starting upload for: ${file.originalname}`);
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const extension = file.originalname.split('.').pop(); // get extension like "jpg"
            const fileName = `${(0, uuid_1.v4)()}.${extension}`; // hash-based name
            // console.log(`🔑 Generated UUID key: ${fileName}`);
            const s3Key = `recruit/${fileName}`; // ✅ save in "uploaded/" folder
            console.log(`🔑 Generated S3 Key: ${s3Key}`);
            cb(null, s3Key);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            console.log(`❌ File rejected: ${file.originalname} (type: ${file.mimetype})`);
            return cb(new Error('Only image files are allowed'));
        }
        console.log(`✅ File accepted: ${file.originalname}`);
        cb(null, true);
    },
});
exports.default = upload;
