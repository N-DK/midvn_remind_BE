import { BusinessLogicError } from '../core/error.response';
import { StatusCodes } from '../core/httpStatusCode';
import { getConnection } from '../dbs/init.mysql';
import vehicleNoGPSModel from '../models/vehicleNoGPS.model';

class VehicleNoGPSService {
    async getVehicleNoGPS(userID: number) {
        try {
            const { conn } = await getConnection();
            try {
                const data = await vehicleNoGPSModel.getAllRowsByUserID(
                    conn,
                    userID,
                );
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
    async getVehicleNoGPSbyID(data: any) {
        try {
            const { conn } = await getConnection();
            try {
                const vehicle = await vehicleNoGPSModel.getVehicleNoGPSbyID(
                    conn,
                    data,
                );
                return vehicle;
            } catch (error) {
                throw error;
            } finally {
                conn.release();
            }
        } catch (error: any) {
            throw new BusinessLogicError(error);
        }
    }

    async addVehicleNoGPS(data: any, userID: number) {
        try {
            const { conn } = await getConnection();
            try {
                const result = vehicleNoGPSModel
                    .addVehicleNoGPS(conn, data, userID)
                    .then((data) => {
                        return data;
                    })
                    .catch((error) => {
                        throw error;
                    });

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

    async updateVehicleNoGPS(data: any, vehicleID: number) {
        try {
            const { conn } = await getConnection();
            try {
                const result = vehicleNoGPSModel
                    .updateVehicleNoGPS(conn, data, vehicleID)
                    .then((data) => {
                        return data;
                    })
                    .catch((error) => {
                        throw new BusinessLogicError(
                            'Trùng dữ liệu trong fields',
                            [error.sqlMessage as never],
                            StatusCodes.CONFLICT,
                        );
                    });
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
    async deleteVehicleNoGPS(vehicleID: number, userID: number) {
        try {
            const { conn } = await getConnection();
            try {
                const result = vehicleNoGPSModel.deleteVehicleNoGPS(
                    conn,
                    userID,
                    vehicleID,
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
    async search(data: any, userID: number) {
        try {
            const { conn } = await getConnection();
            try {
                const result = await vehicleNoGPSModel.search(
                    conn,
                    data,
                    userID,
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
