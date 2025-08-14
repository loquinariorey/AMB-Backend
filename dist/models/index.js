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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sequelize_1 = require("sequelize");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const database_1 = __importDefault(require("../config/database"));
const basename = path.basename(__filename);
const env = process.env.NODE_ENV ||
    "development";
// Ensure config is typed properly
const config = database_1.default[env];
if (!config) {
    throw new Error(`Database config not found for NODE_ENV="${env}"`);
}
// Create Sequelize instance
let sequelize;
if ("use_env_variable" in config &&
    typeof config.use_env_variable === "string") {
    // <-- UPDATED: added type guard
    const dbUrl = process.env[config.use_env_variable];
    if (!dbUrl) {
        throw new Error(`Environment variable "${config.use_env_variable}" is not set`);
    }
    sequelize = new sequelize_1.Sequelize(dbUrl, config);
}
else {
    sequelize = new sequelize_1.Sequelize(config.database, config.username, config.password, config);
}
// Load all models dynamically
const db = {};
fs.readdirSync(__dirname)
    .filter((file) => {
    const ext = path.extname(file);
    return (file !== basename &&
        (ext === ".ts" || ext === ".js") &&
        !file.endsWith(".test.ts") &&
        !file.endsWith(".test.js"));
})
    .forEach((file) => {
    const modelImport = require(path.join(__dirname, file));
    const model = modelImport.default
        ? modelImport.default(sequelize, sequelize_1.DataTypes)
        : modelImport(sequelize, sequelize_1.DataTypes);
    if (model && model.name) {
        db[model.name] = model;
    }
});
// Set up model associations
Object.keys(db).forEach((modelName) => {
    const model = db[modelName];
    if ("associate" in model && typeof model.associate === "function") {
        // <-- UPDATED: safe check for associate
        model.associate(db); // <-- UPDATED: cast to any for TS
    }
});
// Add sequelize properties after models are loaded
db.sequelize = sequelize;
db.Sequelize = sequelize_1.Sequelize;
exports.default = db;
