"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_config_1 = __importDefault(require("./dotenv.config"));
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_PR_CHARSET } = (0, dotenv_config_1.default)();
exports.default = {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    charset: DB_PR_CHARSET,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 500,
    queueLimit: 1000,
};
