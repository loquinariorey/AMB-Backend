"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});
const localDir = path_1.default.join(__dirname, './images');
const uploadFile = (filePath, fileName) => {
    const fileContent = fs_1.default.readFileSync(filePath);
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `recruit/${fileName}`, // prefix "migrated/" to organize uploaded files
        Body: fileContent,
        // ACL: 'public-read',
        ContentType: 'image/jpeg', // or dynamically detect via mime-type lib
    };
    return s3.upload(params).promise();
};
(async () => {
    const files = fs_1.default.readdirSync(localDir);
    for (const file of files) {
        const fullPath = path_1.default.join(localDir, file);
        try {
            const result = await uploadFile(fullPath, file);
            console.log(`✅ Uploaded: ${file} → ${result.Location}`);
        }
        catch (error) {
            console.error(`❌ Failed to upload ${file}:`, error);
        }
    }
})();
