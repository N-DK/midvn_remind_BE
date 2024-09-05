import { PoolConnection } from 'mysql2';
import { tables } from '../constants/tableName.constant';
import DatabaseModel from './database.model';
import { BusinessLogicError } from "../core/error.response";
import { StatusCodes } from "../core/httpStatusCode";

class VehicleNoGPS extends DatabaseModel {
    constructor() {
        super();
    }

    async getAllRowsByUserID(con: PoolConnection, userID: number){
        const result = await this.select(
            con,
            tables.tableVehicleNoGPS,
            'license_plate, user_id, license',
            'user_id = ? AND is_deleted = 0',
            [userID],
        );
        return result;
    }

    async getVehicleNoGPSbyID(con: PoolConnection, vehicleId: number) {
        const result = await this.select(
            con,
            tables.tableVehicleNoGPS,
            'id,license_plate, user_id, license',
            'id = ? AND is_deleted = 0',
            [vehicleId],
        );
        return result;
    }

    async addVehicleNoGPS(con: PoolConnection, data: any, userID: number) {
        let queryText = `INSERT INTO ${tables.tableVehicleNoGPS} (license_plate, user_id, license, create_time, update_time) VALUES `;

        data.forEach((item: any) => {
            queryText += `('${item.license_plate}', ${
                userID
            }, ${item.license}, ${Date.now()}, ${null}),`;
        });

        queryText = queryText.slice(0, -1);

        return new Promise((resolve, reject) => {
            con.query(queryText, (err:any, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    async updateVehicleNoGPS(con: PoolConnection, data: any, vehicleID: number){
        const result = await this.update(
            con,
            tables.tableVehicleNoGPS,
            {license_plate: data.license_plate, 
                license: data.license,
                update_time: Date.now()
            },
            'id',
            vehicleID
        );
        return result;
    }
    async deleteVehicleNoGPS(con: PoolConnection,user_id: number,vehicleID: number){
        const check:any = await this.getVehicleNoGPSbyID(con, vehicleID);
        if(check[0].user_id !== user_id) {
            throw new BusinessLogicError(
                "Đã xảy ra lỗi",
                ['Không được phép' as never],
                StatusCodes.FORBIDDEN
            );
        }
        const result = await this.update(
            con,
            tables.tableVehicleNoGPS,
            {is_deleted: 1},
            'id',
            vehicleID
        );
        return result;
    }

}

export default new VehicleNoGPS();