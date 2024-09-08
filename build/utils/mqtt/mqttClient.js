"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_config_1 = __importDefault(require("../../config/dotenv.config"));
const logger_1 = require("../../logger");
const remindFeature_feature_1 = require("./features/remindFeature.feature");
const uuid_1 = require("uuid");
const { TOPIC_STATUS_GPS } = (0, dotenv_config_1.default)();
const channel = {
    [TOPIC_STATUS_GPS]: remindFeature_feature_1.remindFeature,
};
const handleMessageMqtt = (client_1, _a) => __awaiter(void 0, [client_1, _a], void 0, function* (client, { topic, mess }) {
    var _b;
    const requestId = (0, uuid_1.v4)();
    try {
        if (topic && mess) {
            const data = JSON.parse(mess.toString());
            (_b = channel[topic]) === null || _b === void 0 ? void 0 : _b.call(channel, client, data, requestId);
        }
    }
    catch (error) {
        console.log(error);
        logger_1.mylogger.error('error data mqtt', [
            'handleMessageMqtt',
            requestId,
            { msg: error === null || error === void 0 ? void 0 : error.message, error, mqtt: mess === null || mess === void 0 ? void 0 : mess.toString() },
        ]);
    }
});
exports.default = handleMessageMqtt;
