import { BusinessLogicError } from '../core/error.response';
import { getConnection } from '../dbs/init.mysql';
import vehicleNoGPSModel from '../models/vehicleNoGPS.model';

class VehicleNoGPSService {
    async getVehicleNoGPS() {
        try {
            const { conn } = await getConnection();
            try {
                const data = await vehicleNoGPSModel.getAllRows(conn);
                return data;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error: any) {
            throw new BusinessLogicError(error.msg);
        }
    }

    async addVehicleNoGPS(data: any) {
        try {
            const { conn } = await getConnection();
            try {
                const result = await vehicleNoGPSModel.addVehicleNoGPS(
                    conn,
                    data,
                );
                return result;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error: any) {
            throw new BusinessLogicError(error.msg);
        }
    }
}

export default new VehicleNoGPSService();
