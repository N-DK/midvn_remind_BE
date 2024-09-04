import { PoolConnection } from 'mysql2';
import { tables } from '../constants/tableName.constant';
import DatabaseModel from './database.model';

class VehicleNoGPS extends DatabaseModel {
    constructor() {
        super();
    }

    async getAllRows(con: PoolConnection): Promise<any> {
        const result = await this.select(
            con,
            tables.tableVehicleNoGPS,
            '*',
            'dev_id IS NOT NULL',
            [],
        );
        return result;
    }

    async addVehicleNoGPS(con: PoolConnection, data: any) {
        let queryText = `INSERT INTO ${tables.tableVehicleNoGPS} (dev_id, vehicle_name, user_id, license, create_time, update_time) VALUES `;

        data.forEach((item: any) => {
            queryText += `(${item.vehicle_name}, ${item.vehicle_name}, ${
                item.user_id
            }, ${item.license}, ${Date.now()}, ${Date.now()}),`;
        });

        queryText = queryText.slice(0, -1);

        return new Promise((resolve, reject) => {
            con.query(queryText, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

export default new VehicleNoGPS();
