import axiosAlarm from '../helper/axios.helper';

class GPSApi {
    async getGPSData(token: string) {
        const url = '/api/v1/realtime/gps';

        return await axiosAlarm.get(url, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        });
    }
}

export default new GPSApi();
