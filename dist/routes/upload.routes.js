"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/upload.routes.ts
const express_1 = __importDefault(require("express"));
const upload_aws_1 = __importDefault(require("../middleware/upload_aws"));
const router = express_1.default.Router();
router.post('/upload', upload_aws_1.default.single('file'), (req, res) => {
    res.json({ fileUrl: req.file.location });
});
exports.default = router;
