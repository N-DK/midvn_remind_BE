import { mylogger } from '../../../logger';
import redisModel from '../../../models/redis.model';
import { remindFeature as remindNotify } from 'notify-services';
import reminder from '../../reminder.util';
import configureEnvironment from '../../../config/dotenv.config';

const { SV_NOTIFY } = configureEnvironment();

let reminds: any = [];

const remindFeature = async (client: any, data: any, requestId: any) => {
    const isRedisReady = redisModel.redis.instanceConnect.isReady;

    try {
        if (!data || !Object.keys(data).length) return;

        // Kiểm tra cache trong Redis
        const cacheKey = `reminds:${data.imei}`;
        if (isRedisReady) {
            const { data } = await redisModel.get(
                cacheKey,
                'remindFeature',
                requestId,
            );
            if (data) {
                reminds = JSON.parse(data);
            }
        }

        // Nếu không có trong Redis, gọi database
        if (!reminds) {
            reminds = await reminder.getRemindsByVehicleId(data.imei);
            if (isRedisReady && reminds.length > 0) {
                await redisModel.setWithExpired(
                    cacheKey,
                    JSON.stringify(reminds),
                    60 * 10,
                    'remindFeature',
                    requestId,
                );
            }
        }

        if (reminds.length > 0) {
            for (const remind of reminds) {
                const isOverKm =
                    data.total_distance >=
                    remind.current_kilometers +
                        remind.cumulative_kilometers -
                        remind.km_before;

                if (isOverKm) {
                    remindNotify.sendNotifyRemind(SV_NOTIFY as string, {
                        name_remind: 'Vượt quá số km bảo dưỡng',
                        vehicle_name: data.vehicle_name,
                        user_id: remind.user_id, //remind.user_id,
                    });
                }
            }
        }
    } catch (error) {
        console.log(error);
        mylogger.error('message', ['nameFeature', requestId, error]);
    }
};

export { remindFeature };

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
