"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_chat_aws_1 = __importDefault(require("../middleware/upload_chat_aws")); // 🔥 use new upload
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware_1.default;
const router = express_1.default.Router();
router.post('/file', verifyToken, upload_chat_aws_1.default.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
    }
    const filePath = req.file.location;
    const fileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    console.log(filePath, fileName);
    // console.log("buffer name:", Buffer.from(req.file.originalname));
    res.json({ success: true, filePath, fileName });
});
exports.default = router;
