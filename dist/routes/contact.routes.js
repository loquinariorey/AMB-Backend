"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const contactController_1 = __importDefault(require("../controllers/contactController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { idParamValidation } = validationMiddleware_1.default;
// Routes for specific job
router.get('/', contactController_1.default.getContacts);
router.get('/:id', contactController_1.default.getContactById);
// Routes for specific clinic points
router.post('/', contactController_1.default.createContact);
router.delete('/:id', idParamValidation, contactController_1.default.deleteContact);
exports.default = router;
