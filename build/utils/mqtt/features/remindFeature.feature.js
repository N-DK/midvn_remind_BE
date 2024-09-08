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
Object.defineProperty(exports, "__esModule", { value: true });
exports.remindFeature = void 0;
const logger_1 = require("../../../logger");
const remindFeature = (client, data, requestId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!data || !Object.keys(data).length)
            return;
        // handle data
        // total_distance <- data.total_distance
        // result <- select tbl_remind by data.vehicle_id || data.device_id
        // for(const item of result)
        // if (item.cumulative_kilometers >= total_distance) => send notify
    }
    catch (error) {
        console.log(error);
        logger_1.mylogger.error('message', ['nameFeature', requestId, error]);
    }
});
exports.remindFeature = remindFeature;
