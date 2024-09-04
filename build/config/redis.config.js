"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_config_1 = __importDefault(require("./dotenv.config"));
const { REDIS_HOST, REDIS_PASS, REDIS_PORT } = (0, dotenv_config_1.default)();
exports.default = {
    url: `redis://:${REDIS_PASS}@${REDIS_HOST}:${REDIS_PORT}`,
};
