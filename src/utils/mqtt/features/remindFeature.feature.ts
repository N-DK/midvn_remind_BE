import { mylogger } from '../../../logger';

const remindFeature = async (client: any, data: any, requestId: any) => {
    try {
        if (!data || !Object.keys(data).length) return;
        // handle data
        // total_distance <- data.total_distance
        // result <- select tbl_remind by data.vehicle_id || data.device_id
        // for(const item of result)
        // if (item.cumulative_kilometers >= total_distance) => send notify
    } catch (error) {
        console.log(error);
        mylogger.error('message', ['nameFeature', requestId, error]);
    }
};

export { remindFeature };
