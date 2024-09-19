import { PoolConnection } from 'mysql2';
import { tables } from '../constants/tableName.constant';
import DatabaseModel from './database.model';
import { BusinessLogicError } from '../core/error.response';
import { StatusCodes } from '../core/httpStatusCode';
import reminder from '../utils/reminder.util';
import remindService from '../services/remind.service';

class VehicleNoGPS extends DatabaseModel {
    constructor() {
        super();
    }

    async getAllRowsByUserID(con: PoolConnection, userID: number) {
        const result = await this.select(
            con,
            tables.tableVehicleNoGPS,
            'id, license_plate, user_id, license',
            'user_id = ? AND is_deleted = 0',
            [userID],
        );
        return result;
    }

    async getAllRecord(con: PoolConnection){
        const result = await this.select(
            con,
            tables.tableVehicleNoGPS,
            '*',
            'ID IS NOT NULL',
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
        const recordMap = new Map<string, any>();
        const allRecord:any = await this.getAllRecord(con);
        allRecord.forEach((record: any) => {
            recordMap.set(record.license_plate, record);
        });

        data.forEach((item: any) => {
            const record = recordMap.get(item.license_plate);

            if (
                record &&
                record.user_id !== userID &&
                record.is_deleted === 0
            ) {
                throw new BusinessLogicError(
                    'Duplicate vehicle record',
                    ['Duplicate vehicle record' as never],
                    StatusCodes.CONFLICT,
                );
            }
        });

        let queryText = `INSERT INTO ${tables.tableVehicleNoGPS} 
            (license_plate, user_id, license, create_time, update_time, user_name, user_address) 
            VALUES `;

        data.forEach((item: any) => {
            queryText += `('${item.license_plate}', ${userID}, '${
                item.license
            }', ${Date.now()}, NULL, '${item.user_name}', '${
                item.user_address
            }'),`;
        });

        queryText = queryText.slice(0, -1);

        queryText += ` ON DUPLICATE KEY UPDATE 
            license = VALUES(license), 
            user_name = VALUES(user_name), 
            user_address = VALUES(user_address), 
            update_time = ${Date.now()},
            user_id = ${userID},
            is_deleted = 0`;

        return new Promise((resolve, reject) => {
            con.query(queryText, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    async updateVehicleNoGPS(
        con: PoolConnection,
        data: any,
        vehicleID: number,
    ) {
        const result = await this.update(
            con,
            tables.tableVehicleNoGPS,
            {
                license_plate: data.license_plate,
                license: data.license,
                update_time: Date.now(),
                user_name: data.user_name,
                user_address: data.user_address,
            },
            'id',
            vehicleID,
        );
        return result;
    }
    async deleteVehicleNoGPS(
        con: PoolConnection,
        user_id: number,
        vehicleID: number,
    ) {
        const check: any = await this.getVehicleNoGPSbyID(con, vehicleID);

        await remindService.deleteMultiRemind({
            vehicles: [check[0]?.license_plate],
        });

        if (check[0].user_id !== user_id) {
            throw new BusinessLogicError(
                'Đã xảy ra lỗi',
                ['Không được phép' as never],
                StatusCodes.FORBIDDEN,
            );
        }
        const result = await this.update(
            con,
            tables.tableVehicleNoGPS,
            { is_deleted: 1 },
            'id',
            vehicleID,
        );
        return result;
    }
    async search(con: PoolConnection, data: any, user_id: number) {
        const result = await this.selectWithJoins(
            con,
            tables.tableVehicleNoGPS,
            `${tables.tableVehicleNoGPS}.license_plate AS license_plate,
                 ${tables.tableVehicleNoGPS}.user_id AS user_id,
                 ${tables.tableVehicleNoGPS}.license AS license,
                 ${tables.tableVehicleNoGPS}.create_time AS vehicle_create_time,
                 ${tables.tableVehicleNoGPS}.update_time AS vehicle_update_time,
                 
                 ${tables.tableRemind}.id AS remind_id,
                 ${tables.tableRemind}.img_url AS remind_img_url,
                 ${tables.tableRemind}.note_repair AS note_repair,
                 ${tables.tableRemind}.history_repair AS history_repair,
                 ${tables.tableRemind}.current_kilometers AS current_kilometers,
                 ${tables.tableRemind}.cumulative_kilometers AS cumulative_kilometers,
                 ${tables.tableRemind}.expiration_time AS expiration_time,
                 ${tables.tableRemind}.time_before AS time_before,
                 ${tables.tableRemind}.is_notified AS is_notified,
                 ${tables.tableRemind}.is_received AS is_received,
                 ${tables.tableRemind}.create_time AS remind_create_time,
                 ${tables.tableRemind}.update_time AS remind_update_time,
                 
                 ${tables.tableRemindCategory}.id AS category_id,
                 ${tables.tableRemindCategory}.name AS category_name,
                 ${tables.tableRemindCategory}.desc AS category_desc,
                 ${tables.tableRemindCategory}.icon AS category_icon,
                 ${tables.tableRemindCategory}.create_time AS category_create_time,
                 ${tables.tableRemindCategory}.update_time AS category_update_time,
                 ${tables.tableRemindCategory}.is_deleted AS category_is_deleted`,

            `${tables.tableVehicleNoGPS}.user_id = ? AND (${tables.tableVehicleNoGPS}.license_plate LIKE '%${data.keyword}%' OR ${tables.tableVehicleNoGPS}.license LIKE '%${data.keyword}%') AND ${tables.tableVehicleNoGPS}.is_deleted = 0`,
            [user_id],
            [
                {
                    table: tables.tableRemindVehicle,
                    on: `${tables.tableVehicleNoGPS}.license_plate = ${tables.tableRemindVehicle}.vehicle_id`,
                    type: 'INNER',
                },
                {
                    table: tables.tableRemind,
                    on: `${tables.tableRemindVehicle}.remind_id = ${tables.tableRemind}.id`,
                    type: 'INNER',
                },
                {
                    table: tables.tableRemindCategory,
                    on: `${tables.tableRemind}.remind_category_id = ${tables.tableRemindCategory}.id`,
                    type: 'INNER',
                },
            ],
        );
        return result;
    }
}

export default new VehicleNoGPS();
