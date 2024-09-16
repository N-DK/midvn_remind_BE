import { mylogger } from '../../../logger';
import redisModel from '../../../models/redis.model';
import { remindFeature as remindNotify } from 'notify-services';
import reminder from '../../reminder.util';
import configureEnvironment from '../../../config/dotenv.config';

const { SV_NOTIFY } = configureEnvironment();
// const LIMIT = 5000;
// let count: number = 0;
const remindFeature = async (client: any, data: any, requestId: any) => {
    const isRedisReady = redisModel?.redis?.instanceConnect?.isReady;
    // if (count > LIMIT) count = 0;
    // count++;
    // const isResync = count > LIMIT;

    try {
        // Kiểm tra nếu không có dữ liệu hợp lệ
        if (!data || !Object.keys(data).length) return;

        let reminds: any[] = [];

        if (isRedisReady) {
            // Lấy remind từ Redis nếu Redis sẵn sàng
            reminds =
                (await reminder.groupVehiclesWithObjects(data.imei)) || [];
        } else {
            // Lấy remind từ nguồn khác nếu Redis không sẵn sàng
            const result = await reminder.getReminds(false);

            reminds = result?.[data.imei] || [];
        }

        // Nếu có remind, tiến hành xử lý
        if (reminds.length > 0) {
            await processRemind(data, reminds);
        }
    } catch (error) {
        // console.error('Error', error);
        mylogger.error('message', ['nameFeature', requestId, error]);
    }
};

const processRemind = async (data: any, reminds: any[]) => {
    console.log(`${data.vehicle_name} - ${reminds.length}`);

    for (const remind of reminds) {
        const isOverKm =
            data.total_distance >=
            remind.current_kilometers +
                remind.cumulative_kilometers -
                remind.km_before;

        if (isOverKm) {
            await remindNotify.sendNotifyRemind(SV_NOTIFY as string, {
                name_remind: 'Vượt quá số km bảo dưỡng',
                vehicle_name: data.vehicle_name,
                user_id: remind.user_id,
            });
        }
    }
};

export { remindFeature };
