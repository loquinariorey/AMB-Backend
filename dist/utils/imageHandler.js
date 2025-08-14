"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndReplaceImagesInHTML = exports.uploadToS3 = void 0;
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const cheerio = __importStar(require("cheerio"));
const upload_1 = require("./upload"); // helper for buffer upload
const upload_2 = require("./upload");
const uploadToS3 = async (file) => {
    const key = `articles/${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
    const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read',
    };
    await upload_2.s3.putObject(uploadParams).promise();
    return {
        key,
        url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`,
    };
};
exports.uploadToS3 = uploadToS3;
const parseAndReplaceImagesInHTML = async (html) => {
    if (!html) {
        // If html is undefined, null, or empty string, just return empty result
        return { updatedHTML: '', uploadedImages: [] };
    }
    console.log('Loaded cheerio:', typeof cheerio.load === 'function');
    const $ = cheerio.load(html);
    const uploadedImages = [];
    const images = $('img');
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const src = $(img).attr('src');
        if (src?.startsWith('data:image')) {
            const matches = src.match(/^data:(image\/\w+);base64,(.+)$/);
            if (matches) {
                const mimeType = matches[1];
                const base64Data = Buffer.from(matches[2], 'base64');
                const key = `articles/${(0, uuid_1.v4)()}.png`;
                // Upload buffer to S3
                const upload = await (0, upload_1.uploadBufferToS3)(base64Data, key, mimeType);
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
exports.parseAndReplaceImagesInHTML = parseAndReplaceImagesInHTML;
