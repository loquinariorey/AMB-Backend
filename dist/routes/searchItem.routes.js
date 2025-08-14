"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const searchItemController_1 = __importDefault(require("../controllers/searchItemController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const { verifyToken, isEmployer, isJobSeeker, isAdmin } = authMiddleware_1.default;
const validationMiddleware_1 = __importDefault(require("../middleware/validationMiddleware"));
const { idParamValidation } = validationMiddleware_1.default;
// All routes require admin authentication
router.use(verifyToken);
router.use(isAdmin);
router.get('/', searchItemController_1.default.getAllSearchItems);
router.get('/:id', idParamValidation, searchItemController_1.default.getSearchItemById);
router.post('/', searchItemController_1.default.createSearchItem);
router.put('/:id', idParamValidation, searchItemController_1.default.updateSearchItem);
router.delete('/:id', idParamValidation, searchItemController_1.default.deleteSearchItem);
exports.default = router;
