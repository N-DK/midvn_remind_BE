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
exports.remindFeature = void 0;
const logger_1 = require("../../../logger");
const redis_model_1 = __importDefault(require("../../../models/redis.model"));
const notify_services_1 = require("notify-services");
const reminder_util_1 = __importDefault(require("../../reminder.util"));
const dotenv_config_1 = __importDefault(require("../../../config/dotenv.config"));
const { SV_NOTIFY } = (0, dotenv_config_1.default)();
const remindFeature = (client, data, requestId) => __awaiter(void 0, void 0, void 0, function* () {
    const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
    try {
        // Kiểm tra nếu không có dữ liệu hợp lệ
        if (!data || !Object.keys(data).length)
            return;
        let reminds = [];
        if (isRedisReady) {
            // Lấy remind từ Redis nếu Redis sẵn sàng
            reminds =
                (yield reminder_util_1.default.groupVehiclesWithObjects(data.imei)) || [];
        }
        else {
            // Lấy remind từ nguồn khác nếu Redis không sẵn sàng
            const result = yield reminder_util_1.default.getReminds();
            reminds = (result === null || result === void 0 ? void 0 : result[data.imei]) || [];
        }
        // Nếu có remind, tiến hành xử lý
        if (reminds.length > 0) {
            yield processRemind(data, reminds);
        }
    }
    catch (error) {
        console.error('Error', error);
        logger_1.mylogger.error('message', ['nameFeature', requestId, error]);
    }
});
exports.remindFeature = remindFeature;
const processRemind = (data, reminds) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${data.vehicle_name} - ${reminds.length}`);
    for (const remind of reminds) {
        const isOverKm = data.total_distance >=
            remind.current_kilometers +
                remind.cumulative_kilometers -
                remind.km_before;
        if (isOverKm) {
            yield notify_services_1.remindFeature.sendNotifyRemind(SV_NOTIFY, {
                name_remind: 'Vượt quá số km bảo dưỡng',
                vehicle_name: data.vehicle_name,
                user_id: remind.user_id,
            });
        }
    }
});
// if (data.imei === '2102000171') console.log('remindFeature', data);
// if (isRedisReady) {
//     const { data } = await redisModel.hGetAll(
//         'remind',
//         'remindFeature',
//         requestId,
//     );
//     const results = Object.values(data)
//         .map((item: any) => JSON.parse(item))
//         .filter((item: any) => item.current_kilometers > 0);
//     reminds = results;
// }
// if (reminds.length === 0) {
//     console.log('===>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', reminds);
//     reminds = await reminder.get(data.imei);
// }
