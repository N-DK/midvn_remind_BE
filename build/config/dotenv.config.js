"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const configureEnvironment = () => {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const envPath = `.env.${nodeEnv}`;
    dotenv_1.default.config({ path: envPath });
    return process.env;
};
exports.default = configureEnvironment;
