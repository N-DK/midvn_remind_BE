import axiosAlarm from '../helper/axios.helper';

class GPSApi {
    async getGPSData() {
        const url = '';

        return await axiosAlarm({
            method: 'GET',
            url,
        });
    }
}

export default new GPSApi();
